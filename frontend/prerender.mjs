/**
 * Un HTML complet par URL, écrit après le build.
 *
 * Pourquoi cette étape existe : le site remplace un export statique Next où
 * chaque route était prérendue. Une application à page unique sert un seul
 * index.html, donc un robot et un aperçu de lien verraient la même page
 * générique sur les quatorze URL. Le dépôt piighost-seo mesure cette visibilité
 * tous les jours, et la perdre se verrait.
 *
 * Le rendu vient de Svelte lui-même, pas d'un navigateur sans tête : la sortie
 * est déterministe, il n'y a rien à attendre, et le build ne dépend pas d'un
 * Chrome installé.
 *
 *   node prerender.mjs        appelé par `pnpm build`
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const DIST = "dist";
const SSR = "./dist-ssr/entry-server.js";
/** La politique servie par nginx, écrite ici parce que les empreintes des blocs
 *  schema.org ne sont connues qu'après le rendu. deploy/security-headers.conf
 *  l'inclut, Dockerfile.web la copie dans l'image. */
const CSP = "csp.conf";
/** L'origine annoncée aux aperçus de lien (Discord, Slack, réseaux). Une copie du
 *  site servie ailleurs que sur piighost.dev la passe au build : sans elle, son
 *  aperçu montrait la vignette du site en ligne, pas la sienne. Le canonique,
 *  lui, reste piighost.dev : une copie de test ne doit pas se déclarer
 *  l'original. */
const PARTAGE = (process.env.SITE_ORIGIN || "https://piighost.dev").replace(
  /\/$/,
  "",
);

const { rendre, toutesLesUrls } = await import(SSR);

const gabarit = await readFile(join(DIST, "index.html"), "utf8");

/** Remplace une balise entière, et échoue si elle manque.
 *
 *  L'ancienne version rendait la page telle quelle quand le motif ne trouvait
 *  rien. Prettier avait coupé la balise og:description sur trois lignes, le
 *  motif l'attendait sur une seule, et les quatorze pages ont annoncé la même
 *  description anglaise du gabarit sans que le build ne dise rien. */
function poser(html, motif, remplacement, url) {
  if (!motif.test(html)) {
    throw new Error(`prérendu : ${motif} introuvable dans le gabarit (${url})`);
  }
  // Une fonction plutôt qu'une chaîne : un `$` dans un texte serait sinon lu
  // comme un motif de remplacement.
  return html.replace(motif, () => remplacement);
}

/** Une balise meta repérée par son attribut, quels que soient les espaces et
 *  les sauts de ligne entre `<meta` et la fin de la balise. Le guillemet
 *  fermant compte, sinon `og:locale` trouverait aussi `og:locale:alternate`. */
const metaMotif = (attribut, valeur) =>
  new RegExp(`<meta\\s+${attribut}="${valeur}"[^>]*>`);

const echappe = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Les empreintes des blocs schema.org, dédoublonnées entre les quatorze pages.
 *  La CSP est script-src 'self' sans unsafe-inline : un bloc non autorisé est
 *  refusé par le navigateur, et les données structurées disparaissent sans que
 *  rien ne le signale. */
const empreintes = new Set();

/** Un bloc ld+json prêt à écrire, et son empreinte. */
function structuree(donnees) {
  // Un `<` échappé dans les chaînes : sans cela une valeur contenant
  // `</script>` fermerait la balise depuis l'intérieur.
  const json = JSON.stringify(donnees).replace(/</g, "\\u003c");
  const hash = createHash("sha256").update(json, "utf8").digest("base64");
  empreintes.add(`'sha256-${hash}'`);
  return `<script type="application/ld+json">${json}</script>`;
}

let ecrites = 0;
for (const { url, nom, locale } of toutesLesUrls()) {
  const {
    corps,
    tete,
    titre,
    description,
    lang,
    ogLocale,
    ogLocaleAlternate,
    ogImageAlt,
    jsonld,
  } = rendre(nom, locale);

  let html = gabarit;
  html = poser(html, /<html lang="fr">/, `<html lang="${lang}">`, url);
  html = poser(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title>${echappe(titre)}</title>`,
    url,
  );
  html = poser(
    html,
    /<link\s+rel="canonical"[^>]*>/,
    `<link rel="canonical" href="https://piighost.dev${url}" />`,
    url,
  );
  /** Chaque balise meta du gabarit et sa valeur pour cette page. */
  const metas = [
    ["name", "description", description],
    ["property", "og:title", titre],
    ["property", "og:description", description],
    ["property", "og:url", `${PARTAGE}${url}`],
    ["property", "og:locale", ogLocale],
    ["property", "og:locale:alternate", ogLocaleAlternate],
    ["property", "og:image", `${PARTAGE}/og.png`],
    ["property", "og:image:alt", ogImageAlt],
    ["name", "twitter:title", titre],
    ["name", "twitter:description", description],
  ];
  for (const [attribut, valeur, contenu] of metas) {
    html = poser(
      html,
      metaMotif(attribut, valeur),
      `<meta ${attribut}="${valeur}" content="${echappe(contenu)}" />`,
      url,
    );
  }
  const structurees = jsonld.map(structuree).join("\n    ");
  html = html.replace("</head>", `  ${tete}\n    ${structurees}\n  </head>`);
  html = html.replace('<div id="app"></div>', `<div id="app">${corps}</div>`);

  const chemin = join(DIST, url.replace(/^\//, ""), "index.html");
  await mkdir(dirname(chemin), { recursive: true });
  await writeFile(chemin, html);
  ecrites += 1;
}

const politique = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data:",
  "style-src 'self'",
  `script-src 'self' ${[...empreintes].sort().join(" ")}`,
  "connect-src 'self'",
  "form-action 'self'",
].join("; ");

await writeFile(
  CSP,
  [
    "# Généré par frontend/prerender.mjs. Ne pas éditer à la main.",
    "#",
    "# script-src porte l'empreinte de chaque bloc schema.org écrit dans les pages.",
    "# Un bloc ld+json est un élément script : sans son empreinte, la politique le",
    "# refuse et les données structurées du site disparaissent en silence.",
    `add_header Content-Security-Policy "${politique}" always;`,
    "",
  ].join("\n"),
);

console.log(
  `prérendu : ${ecrites} pages écrites dans ${DIST}/, ` +
    `${empreintes.size} empreintes dans ${CSP}`,
);
