/**
 * Les articles du blog, lus au build et rendus en arbre de contenu.
 *
 * Un article est un fichier Markdown avec un en-tête YAML, rangé par langue :
 * `src/content/blog/{fr,en}/<slug>.md`. Le même slug dans les deux langues
 * désigne deux traductions. Ses images vivent dans `public/blog/<slug>/`, et
 * le Markdown les cite en `assets/<fichier>`.
 *
 * Le Markdown ne devient pas du HTML injecté avec `{@html}`. Il devient
 * l'arbre que rend `Content` de @piighost/ui, parce que cet arbre passe par
 * Svelte. Il est donc prérendu puis hydraté, et ses blocs de code sont le
 * vrai `CodeBlock` du site, bouton de copie compris. Le HTML brut est refusé
 * à l'analyse, et aucun attribut `style` ou `on*` n'est jamais écrit : la
 * politique de production est `style-src 'self'`.
 *
 * Ce module tourne dans Node, au build et dans le serveur de développement.
 * Il n'entre jamais dans le bundle du navigateur.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import MarkdownIt, { type Token } from "markdown-it";
import { parse as lireYaml } from "yaml";
import type { ContentNode } from "@piighost/ui/content";
import {
  pythonTokens,
  regexTokens,
  shellTokens,
  tomlTokens,
  type Token as Jeton,
} from "../src/lib/highlight.ts";
import routes from "../../routes.json" with { type: "json" };

export type Locale = "fr" | "en";

/** Ce qu'un article dit de lui-même, sans son corps. Sert à l'index, aux
 *  balises d'en-tête et aux données structurées. */
export type ArticleMeta = {
  slug: string;
  lang: Locale;
  title: string;
  description: string;
  /** Date de publication, `AAAA-MM-JJ`. */
  date: string;
  /** Date de dernière modification, la date de publication par défaut. */
  updated: string;
  tags: string[];
  author: string;
  draft: boolean;
  /** Le temps de lecture, en minutes entières, au moins une. */
  minutes: number;
  /** Vrai quand l'article est publié dans les deux langues. */
  translated: boolean;
};

export type Article = { meta: ArticleMeta; nodes: ContentNode[] };

const LOCALES = routes.locales as Locale[];

/** Un slug en minuscules et tirets, ce que deviendra l'URL. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Mots lus par minute. Une valeur moyenne pour un texte technique. */
const MOTS_PAR_MINUTE = 230;

/** Les langages que le tokeniseur du site sait colorer, sous leurs noms
 *  usuels dans une clôture de code. Les autres sortent en texte brut, ce qui
 *  vaut mieux qu'une coloration fausse. */
const TOKENISEURS: Record<string, (code: string) => Jeton[]> = {
  python: pythonTokens,
  py: pythonTokens,
  bash: shellTokens,
  sh: shellTokens,
  shell: shellTokens,
  console: shellTokens,
  zsh: shellTokens,
  toml: tomlTokens,
  regex: regexTokens,
};

/** L'alignement d'une colonne de tableau, écrit en attribut. markdown-it le
 *  pose en `style`, que la politique de production refuse. app.css le lit. */
const ALIGNEMENTS: Record<string, string> = {
  "text-align:left": "left",
  "text-align:center": "center",
  "text-align:right": "right",
};

const markdown = new MarkdownIt({ html: false, linkify: true });

/** Une erreur qui nomme le fichier fautif : un build qui échoue doit dire où. */
class ArticleInvalide extends Error {
  constructor(fichier: string, message: string) {
    super(`blog : ${fichier} : ${message}`);
  }
}

/** La typographie française : l'espace avant `: ; ! ? »` et après `«` ne se
 *  coupe pas, et reste fine. Seule une espace ordinaire est remplacée, une
 *  insécable déjà écrite est gardée. Jamais dans le code. */
function composer(texte: string, lang: Locale): string {
  if (lang !== "fr") return texte;
  return texte.replace(/ ([:;!?»])/g, " $1").replace(/« /g, "« ");
}

/** L'ancre d'un titre, à la manière de GitHub : minuscules, accents retirés,
 *  ponctuation retirée, espaces en tirets, suffixe si elle se répète. */
function ancreur() {
  const vues = new Map<string, number>();
  return (texte: string) => {
    const base =
      texte
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .trim()
        .replace(/\s+/g, "-") || "section";
    const n = vues.get(base) ?? 0;
    vues.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  };
}

/** Le texte lisible d'un arbre, pour une ancre ou le temps de lecture. */
function texteDe(noeuds: ContentNode[]): string {
  return noeuds
    .map((n) =>
      n.type === "text"
        ? n.value
        : n.type === "element"
          ? texteDe(n.children ?? [])
          : "",
    )
    .join("");
}

/** La largeur et la hauteur d'une image, quand elles se lisent sans
 *  dépendance : l'en-tête d'un PNG, les attributs d'un SVG. Elles réservent
 *  la place de l'image avant son chargement, et la page ne saute pas. */
function dimensions(chemin: string): { width: number; height: number } | null {
  const octets = readFileSync(chemin);
  if (chemin.endsWith(".png") && octets.length > 24) {
    return { width: octets.readUInt32BE(16), height: octets.readUInt32BE(20) };
  }
  if (chemin.endsWith(".svg")) {
    const balise = octets.toString("utf8").match(/<svg\b[^>]*>/)?.[0] ?? "";
    const vue = balise.match(
      /viewBox="[\d.]+[\s,]+[\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)"/,
    );
    if (vue) return { width: Math.round(+vue[1]), height: Math.round(+vue[2]) };
  }
  return null;
}

type Contexte = {
  fichier: string;
  lang: Locale;
  slug: string;
  public: string;
  ancre: (texte: string) => string;
};

/** Un attribut d'un jeton, en texte. markdown-it type ses valeurs en texte
 *  ou en nombre. */
function attr(jeton: Token, nom: string): string | null {
  const valeur = jeton.attrGet(nom);
  return valeur === null ? null : String(valeur);
}

/** Un élément ouvrant, avec les seuls attributs que le site accepte. */
function ouvrir(
  jeton: Token,
  ctx: Contexte,
): ContentNode & { type: "element" } {
  const tag = jeton.tag;
  if (tag === "h1") {
    throw new ArticleInvalide(
      ctx.fichier,
      "un titre `#` dans le corps. Le titre de la page vient de l'en-tête, le corps commence à `##`.",
    );
  }
  const attrs: Record<string, string> = {};
  if (tag === "a") {
    const href = attr(jeton, "href") ?? "";
    attrs.href = href;
    const titre = attr(jeton, "title");
    if (titre) attrs.title = titre;
    // Un lien vers un autre site ne lui transmet pas l'adresse de la page.
    if (
      /^https?:\/\//.test(href) &&
      !href.startsWith("https://piighost.dev/")
    ) {
      attrs.rel = "noreferrer";
    }
  }
  if (tag === "ol") {
    const debut = attr(jeton, "start");
    if (debut) attrs.start = debut;
  }
  if (tag === "th" || tag === "td") {
    const alignement = ALIGNEMENTS[attr(jeton, "style") ?? ""];
    if (alignement) attrs["data-align"] = alignement;
  }
  if (tag === "table") {
    // Le tableau défile seul sur un téléphone : il doit pouvoir prendre le
    // focus, sinon le clavier ne le fait pas défiler.
    attrs.tabindex = "0";
  }
  return {
    type: "element",
    tag,
    ...(Object.keys(attrs).length && { attrs }),
    children: [],
  };
}

/** Une image du corps, réécrite vers `public/blog/<slug>/`. */
function image(jeton: Token, ctx: Contexte): ContentNode {
  const src = attr(jeton, "src") ?? "";
  const alt = jeton.content;
  if (/^(https?:)?\/\//.test(src)) {
    throw new ArticleInvalide(
      ctx.fichier,
      `image distante ${src}. La politique img-src 'self' la bloquerait : copiez-la dans public/blog/${ctx.slug}/.`,
    );
  }
  if (!alt.trim()) {
    throw new ArticleInvalide(
      ctx.fichier,
      `l'image ${src} n'a pas de texte alternatif.`,
    );
  }
  let url = src;
  const fichier = src.match(/^(?:\.\/)?assets\/(.+)$/)?.[1];
  if (fichier) {
    const disque = join(ctx.public, "blog", ctx.slug, fichier);
    if (!existsSync(disque)) {
      throw new ArticleInvalide(ctx.fichier, `image introuvable : ${disque}`);
    }
    url = `/blog/${ctx.slug}/${fichier}`;
    const taille = dimensions(disque);
    const attrs: Record<string, string | number> = {
      src: url,
      alt,
      loading: "lazy",
      decoding: "async",
      ...(taille ?? {}),
    };
    const titre = attr(jeton, "title");
    if (titre) attrs.title = titre;
    return { type: "element", tag: "img", attrs };
  }
  return {
    type: "element",
    tag: "img",
    attrs: { src: url, alt, loading: "lazy", decoding: "async" },
  };
}

/** Un bloc de code, coloré au build par le tokeniseur du site. */
function code(jeton: Token): ContentNode {
  const langage = jeton.info.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  const source = jeton.content.replace(/\n$/, "");
  const tokeniser = TOKENISEURS[langage];
  return {
    type: "code",
    code: source,
    ...(tokeniser && { tokens: tokeniser(source) }),
  };
}

/** Un flux de jetons markdown-it, plat, devenu arbre. Les jetons ouvrants
 *  empilent un élément, les fermants le dépilent. */
function arbre(jetons: Token[], ctx: Contexte): ContentNode[] {
  const racine: ContentNode[] = [];
  const pile: ContentNode[][] = [racine];
  const ici = () => pile[pile.length - 1];

  for (const jeton of jetons) {
    // Un paragraphe d'une liste serrée est caché : son texte va directement
    // dans l'élément de liste, sans `<p>`.
    if (jeton.hidden) continue;
    if (jeton.nesting === 1) {
      const element = ouvrir(jeton, ctx);
      ici().push(element);
      pile.push(element.children!);
      continue;
    }
    if (jeton.nesting === -1) {
      const ferme = pile.pop() ?? [];
      ferme.splice(0, ferme.length, ...fusionner(ferme));
      // Un titre reçoit son ancre une fois son texte connu.
      const parent = ici();
      const dernier = parent[parent.length - 1];
      if (
        dernier?.type === "element" &&
        /^h[2-6]$/.test(dernier.tag) &&
        dernier.children === ferme
      ) {
        dernier.attrs = { ...dernier.attrs, id: ctx.ancre(texteDe(ferme)) };
      }
      continue;
    }
    switch (jeton.type) {
      case "inline":
        ici().push(...arbre(jeton.children ?? [], ctx));
        break;
      case "text":
        ici().push({ type: "text", value: composer(jeton.content, ctx.lang) });
        break;
      case "code_inline":
        ici().push({
          type: "element",
          tag: "code",
          children: [{ type: "text", value: jeton.content }],
        });
        break;
      case "softbreak":
        ici().push({ type: "text", value: "\n" });
        break;
      case "hardbreak":
        ici().push({ type: "element", tag: "br" });
        break;
      case "image":
        ici().push(image(jeton, ctx));
        break;
      case "fence":
      case "code_block":
        ici().push(code(jeton));
        break;
      case "hr":
        ici().push({ type: "element", tag: "hr" });
        break;
      default:
        throw new ArticleInvalide(
          ctx.fichier,
          `élément Markdown non pris en charge : ${jeton.type}`,
        );
    }
  }
  return fusionner(racine);
}

/** Deux textes voisins n'en font qu'un. Le rendu serveur les écrit d'un seul
 *  tenant, et l'hydratation n'a ainsi qu'un nœud texte à retrouver. */
function fusionner(noeuds: ContentNode[]): ContentNode[] {
  const sortie: ContentNode[] = [];
  for (const noeud of noeuds) {
    const avant = sortie[sortie.length - 1];
    if (noeud.type === "text" && avant?.type === "text")
      avant.value += noeud.value;
    else sortie.push(noeud);
  }
  return sortie;
}

/** Au-delà de trois colonnes, un tableau devient une pile de cartes sur un
 *  téléphone, comme la charte le demande : il défilerait sinon sur plus de
 *  la moitié de sa largeur. Chaque cellule reçoit l'intitulé de sa colonne
 *  dans `data-label`, que app.css affiche devant elle. Un tableau plus étroit
 *  garde son défilement horizontal. */
function cartes(noeuds: ContentNode[]): void {
  const elements = (n: ContentNode[] | undefined, tag: string) =>
    (n ?? []).filter(
      (e): e is ContentNode & { type: "element" } =>
        e.type === "element" && e.tag === tag,
    );
  for (const noeud of noeuds) {
    if (noeud.type !== "element") continue;
    if (noeud.tag !== "table") {
      cartes(noeud.children ?? []);
      continue;
    }
    const [entete] = elements(noeud.children, "thead");
    const [ligne] = elements(entete?.children, "tr");
    const intitules = elements(ligne?.children, "th").map((th) =>
      texteDe(th.children ?? []).trim(),
    );
    if (intitules.length <= 3) continue;
    noeud.attrs = { ...noeud.attrs, "data-cartes": "true" };
    for (const corps of elements(noeud.children, "tbody")) {
      for (const tr of elements(corps.children, "tr")) {
        elements(tr.children, "td").forEach((td, i) => {
          if (intitules[i])
            td.attrs = { ...td.attrs, "data-label": intitules[i] };
        });
      }
    }
  }
}

/** Le nombre de mots lus, hors blocs de code. */
function mots(noeuds: ContentNode[]): number {
  return texteDe(noeuds).split(/\s+/).filter(Boolean).length;
}

/** L'en-tête YAML et le corps d'un fichier. */
function separer(
  source: string,
  fichier: string,
): { entete: unknown; corps: string } {
  const trouve = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!trouve)
    throw new ArticleInvalide(fichier, "en-tête YAML `---` manquant.");
  return { entete: lireYaml(trouve[1]), corps: trouve[2] };
}

function chaine(valeur: unknown, champ: string, fichier: string): string {
  if (typeof valeur !== "string" || !valeur.trim()) {
    throw new ArticleInvalide(
      fichier,
      `le champ \`${champ}\` doit être un texte non vide.`,
    );
  }
  return valeur.trim();
}

function date(valeur: unknown, champ: string, fichier: string): string {
  // YAML 1.2 lit `2026-10-07` comme un texte. Une date d'un autre schéma,
  // déjà convertie, est ramenée à la même forme.
  const texte =
    valeur instanceof Date ? valeur.toISOString().slice(0, 10) : valeur;
  if (
    typeof texte !== "string" ||
    !DATE.test(texte) ||
    Number.isNaN(Date.parse(texte))
  ) {
    throw new ArticleInvalide(
      fichier,
      `le champ \`${champ}\` doit être une date AAAA-MM-JJ.`,
    );
  }
  return texte;
}

/** Lit et valide un article. Le dossier fixe la langue, le nom fixe le slug,
 *  et l'en-tête doit dire la même chose : un fichier copié d'une langue à
 *  l'autre sans mettre à jour son en-tête est attrapé ici. */
function lireArticle(
  fichier: string,
  lang: Locale,
  slug: string,
  publicDir: string,
): Article {
  const { entete, corps } = separer(readFileSync(fichier, "utf8"), fichier);
  if (!entete || typeof entete !== "object") {
    throw new ArticleInvalide(fichier, "l'en-tête YAML est vide.");
  }
  const e = entete as Record<string, unknown>;
  if (e.lang !== lang) {
    throw new ArticleInvalide(
      fichier,
      `lang vaut ${String(e.lang)}, le dossier dit ${lang}.`,
    );
  }
  if (e.slug !== slug) {
    throw new ArticleInvalide(
      fichier,
      `slug vaut ${String(e.slug)}, le fichier s'appelle ${slug}.md.`,
    );
  }
  if (
    !Array.isArray(e.tags) ||
    !e.tags.every((t) => typeof t === "string" && t.trim())
  ) {
    throw new ArticleInvalide(
      fichier,
      "le champ `tags` doit être une liste de textes.",
    );
  }
  if (e.draft !== undefined && typeof e.draft !== "boolean") {
    throw new ArticleInvalide(
      fichier,
      "le champ `draft` doit valoir true ou false.",
    );
  }
  const publie = date(e.date, "date", fichier);
  const modifie =
    e.updated === undefined ? publie : date(e.updated, "updated", fichier);

  const ctx: Contexte = {
    fichier,
    lang,
    slug,
    public: publicDir,
    ancre: ancreur(),
  };
  const nodes = arbre(markdown.parse(corps, {}), ctx);
  cartes(nodes);

  return {
    meta: {
      slug,
      lang,
      title: composer(chaine(e.title, "title", fichier), lang),
      description: composer(
        chaine(e.description, "description", fichier),
        lang,
      ),
      date: publie,
      updated: modifie,
      tags: (e.tags as string[]).map((t) => t.trim()),
      author: chaine(e.author, "author", fichier),
      draft: e.draft === true,
      minutes: Math.max(1, Math.round(mots(nodes) / MOTS_PAR_MINUTE)),
      translated: false,
    },
    nodes,
  };
}

/**
 * Tous les articles, le plus récent d'abord.
 *
 * Un brouillon (`draft: true`) n'existe pas pour le build de production : ni
 * page, ni entrée d'index, ni lien de traduction. `brouillons` le fait
 * apparaître, c'est ce que pose `BLOG_DRAFTS=1`.
 */
export function lireArticles(options: {
  contenu: string;
  public: string;
  brouillons: boolean;
}): Article[] {
  const articles: Article[] = [];
  for (const lang of LOCALES) {
    const dossier = join(options.contenu, lang);
    if (!existsSync(dossier)) continue;
    for (const nom of readdirSync(dossier).sort()) {
      if (!nom.endsWith(".md")) continue;
      const slug = nom.slice(0, -3);
      const fichier = join(dossier, nom);
      if (!SLUG.test(slug)) {
        throw new ArticleInvalide(
          fichier,
          "le nom doit être en minuscules et tirets (kebab-case).",
        );
      }
      const article = lireArticle(fichier, lang, slug, options.public);
      if (article.meta.draft && !options.brouillons) continue;
      articles.push(article);
    }
  }
  for (const { meta } of articles) {
    meta.translated = LOCALES.every((l) =>
      articles.some((a) => a.meta.slug === meta.slug && a.meta.lang === l),
    );
  }
  return articles.sort(
    (a, b) =>
      b.meta.date.localeCompare(a.meta.date) ||
      a.meta.slug.localeCompare(b.meta.slug),
  );
}
