/**
 * Les balises d'en-tête, écrites au même endroit pour le client et le prérendu.
 *
 * Une application à page unique ne change pas son `<title>` toute seule, et un
 * robot qui n'exécute pas le script ne verrait que le repli d'index.html. Ces
 * fonctions servent donc deux fois : le prérendu les appelle au build pour
 * écrire un HTML par route, et le routeur les rappelle à la navigation pour
 * que l'onglet et l'historique disent la vérité.
 *
 * Les textes viennent du dictionnaire, clé pour clé comme sur le site actuel :
 * `seo.defaultTitle` pour l'accueil, `seo.pages.*` pour les projets, et le
 * gabarit « %s - piighost » pour tout ce qui n'est pas l'accueil.
 */

import {
  ORIGINE,
  lienDe,
  LOCALES,
  LOCALE_DEFAUT,
  traduire,
  type Locale,
  type NomDePage,
  type Route,
} from "./routes";
import { dictionaries } from "../i18n";
import type { Dictionary } from "../i18n";
import { lienFlux, trouver, type ArticleMeta } from "./blog.svelte";

type Entree = (t: Dictionary) => { titre: string; description: string };

const PAGES: Record<NomDePage, Entree> = {
  home: (t) => ({
    titre: t.seo.defaultTitle,
    description: t.seo.defaultDescription,
  }),
  // Les pages projet ont un titre complet, qui dit ce qu'est le projet : un
  // gabarit « piighost-api - piighost » ne disait rien, et le titre de
  // piighost était écrit en anglais sur la page française.
  piighost: (t) => ({
    titre: t.seo.titles.piighost,
    description: t.seo.pages.piighost,
  }),
  api: (t) => ({
    titre: t.seo.titles.api,
    description: t.seo.pages.api,
  }),
  chat: (t) => ({
    titre: t.seo.titles.chat,
    description: t.seo.pages.chat,
  }),
  proofreader: (t) => ({
    titre: t.seo.titles.proofreader,
    description: t.seo.pages.proofreader,
  }),
  caviardage: (t) => ({
    titre: t.seo.titles.caviardage,
    description: t.seo.pages.caviardage,
  }),
  // Le titre d'onglet porte le terme de recherche, « avant un LLM » ; le titre
  // visible de la page reste la question courte.
  philosophy: (t) => ({
    titre: t.seo.titles.philosophy,
    description: t.seo.philosophyDescription,
  }),
  blog: (t) => ({
    titre: t.seo.titles.blog,
    description: t.seo.pages.blog,
  }),
};

/** L'article d'une route, s'il y en a un. */
const articleDe = (route: Route): ArticleMeta | undefined =>
  route.article ? trouver(route.locale, route.article) : undefined;

/** Le titre et la description d'une page, dans une langue. Un article prend
 *  les siens dans son en-tête, sous le gabarit « %s - piighost ». */
export function meta(route: Route): { titre: string; description: string } {
  const article = articleDe(route);
  if (article) {
    return {
      titre: `${article.title} - piighost`,
      description: article.description,
    };
  }
  return PAGES[route.nom](dictionaries[route.locale]);
}

/** L'adresse canonique d'une page. */
export const canonique = (route: Route) => `${ORIGINE}${lienDe(route)}`;

/** Les langues dans lesquelles cette page existe. Toutes pour une page de
 *  routes.json, une seule pour un article publié dans une seule langue. */
function langues(route: Route): Locale[] {
  if (!route.article) return [...LOCALES];
  return LOCALES.filter((l) => trouver(l, route.article ?? ""));
}

/** Les variantes de langue, ce que `hreflang` doit annoncer.
 *
 *  `x-default` vise la langue par défaut, pas une URL sans préfixe : ces
 *  dernières ne sont servies par personne, et un hreflang qui pointe vers une
 *  404 est pire que pas de hreflang du tout. Pour la même raison, un article
 *  publié dans une seule langue n'annonce aucune variante. */
export function alternatives(
  route: Route,
): { locale: Locale | "x-default"; url: string }[] {
  const disponibles = langues(route);
  if (disponibles.length < LOCALES.length) return [];
  return [
    ...disponibles.map((l) => ({
      locale: l,
      url: canonique(traduire(route, l)),
    })),
    {
      locale: "x-default" as const,
      url: canonique(traduire(route, LOCALE_DEFAUT)),
    },
  ];
}

/** `og:locale:alternate`, ou null quand la page n'existe que dans sa langue. */
export function ogLocaleAlternative(route: Route): string | null {
  const autre = autreLocale(route.locale);
  return langues(route).includes(autre) ? OG_LOCALE[autre] : null;
}

/** Les balises Open Graph propres à un article : sa date, sa dernière
 *  modification, son auteur et ses étiquettes. Vide hors article. */
export function balisesArticle(route: Route): [string, string][] {
  const article = articleDe(route);
  if (!article) return [];
  return [
    ["article:published_time", article.date],
    ["article:modified_time", article.updated],
    ["article:author", article.author],
    ...article.tags.map((tag): [string, string] => ["article:tag", tag]),
  ];
}

/** Le lien vers le flux Atom du blog, dans la langue de la page. Sur toutes
 *  les pages : un lecteur de flux qui reçoit l'adresse du site le trouve. */
export function lienDuFlux(locale: Locale): { titre: string; href: string } {
  return { titre: dictionaries[locale].blog.feedTitle, href: lienFlux(locale) };
}

/** Applique les balises au document courant. Sans effet au prérendu. */
export function appliquer(route: Route) {
  if (typeof document === "undefined") return;
  const { locale } = route;
  const { titre, description } = meta(route);
  document.title = titre;
  document.documentElement.lang = locale;
  poser("meta[name='description']", "content", description);
  poser("link[rel='canonical']", "href", canonique(route));
  poser(
    "meta[property='og:type']",
    "content",
    articleDe(route) ? "article" : "website",
  );
  poser("meta[property='og:title']", "content", titre);
  poser("meta[property='og:description']", "content", description);
  poser("meta[property='og:url']", "content", canonique(route));
  poser("meta[property='og:locale']", "content", OG_LOCALE[locale]);
  const flux = lienDuFlux(locale);
  poser("link[type='application/atom+xml']", "href", flux.href);
  poser("link[type='application/atom+xml']", "title", flux.titre);
  poser(
    "meta[property='og:locale:alternate']",
    "content",
    OG_LOCALE[autreLocale(locale)],
  );
  poser(
    "meta[property='og:image']",
    "content",
    `https://piighost.dev/og-${locale}.png`,
  );
  poser(
    "meta[property='og:image:alt']",
    "content",
    dictionaries[locale].seo.ogImageAlt,
  );
  poser("meta[name='twitter:title']", "content", titre);
  poser("meta[name='twitter:description']", "content", description);
}

/** La forme Open Graph d'une langue : `fr_FR`, `en_US`. */
export const OG_LOCALE: Record<Locale, string> = { fr: "fr_FR", en: "en_US" };

/** L'autre langue du site, celle qu'annonce `og:locale:alternate`. */
export const autreLocale = (locale: Locale): Locale =>
  LOCALES.find((l) => l !== locale) ?? locale;

function poser(selecteur: string, attribut: string, valeur: string) {
  document.querySelector(selecteur)?.setAttribute(attribut, valeur);
}
