/**
 * L'entrée du rendu serveur, utilisée uniquement au build par le prérendu.
 *
 * Elle ne tourne jamais en production : nginx sert des fichiers. Elle existe
 * pour que chaque URL ait un HTML complet avant qu'un script ne s'exécute,
 * parce qu'un robot qui n'exécute rien ne verrait sinon qu'une page vide,
 * quatorze fois.
 */

import { render } from "svelte/server";
import App from "./App.svelte";
import { router } from "./lib/router.svelte";
import {
  meta,
  alternatives,
  balisesArticle,
  lienDuFlux,
  ogLocaleAlternative,
  OG_LOCALE,
} from "./lib/head";
import { dictionaries } from "./i18n";
import { donneesStructurees } from "./lib/jsonld";
import { charger } from "./lib/blog.svelte";
import type { Locale, Route } from "./lib/routes";

export { toutesLesUrls } from "./lib/routes";

export type Rendu = {
  corps: string;
  tete: string;
  titre: string;
  description: string;
  lang: Locale;
  /** `og:locale` et `og:locale:alternate`, au format Open Graph. Pas
   *  d'alternative pour un article publié dans une seule langue. */
  ogLocale: string;
  ogLocaleAlternate: string | null;
  /** `article` pour un billet du blog, `website` partout ailleurs. */
  ogType: "article" | "website";
  /** Le texte alternatif de l'image de partage, dans la langue de la page. */
  ogImageAlt: string;
  /** Les blocs schema.org de la page. Sérialisés par le prérendu, jamais par
   *  un composant : voir lib/jsonld.ts. */
  jsonld: object[];
};

/** Échappe une valeur d'attribut écrite à la main ci-dessous. */
const attribut = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Le HTML d'une route. Asynchrone parce que le corps d'un article est un
 *  module à part, chargé avant le rendu : sans lui, la page prérendue
 *  n'aurait que son titre. */
export async function rendre(route: Route): Promise<Rendu> {
  const { locale } = route;
  if (route.article) await charger(locale, route.article);
  router.definir(route.nom, locale, route.article ?? null);
  const { body, head } = render(App);
  const { titre, description } = meta(route);

  const liens = alternatives(route).map(
    (a) => `<link rel="alternate" hreflang="${a.locale}" href="${a.url}" />`,
  );
  const flux = lienDuFlux(locale);
  const balises = balisesArticle(route).map(
    ([propriete, valeur]) =>
      `<meta property="${propriete}" content="${attribut(valeur)}" />`,
  );

  return {
    corps: body,
    // Pas de canonique ici : prerender.mjs remplace celui du gabarit. L'écrire
    // aux deux endroits en produisait deux, et deux canoniques valent zéro.
    tete: [
      head,
      ...liens,
      `<link rel="alternate" type="application/atom+xml" title="${attribut(flux.titre)}" href="${flux.href}" />`,
      ...balises,
    ]
      .filter(Boolean)
      .join("\n    "),
    titre,
    description,
    lang: locale,
    ogLocale: OG_LOCALE[locale],
    ogLocaleAlternate: ogLocaleAlternative(route),
    ogType: route.article ? "article" : "website",
    ogImageAlt: dictionaries[locale].seo.ogImageAlt,
    jsonld: donneesStructurees(route),
  };
}
