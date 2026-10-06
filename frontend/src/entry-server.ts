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
import { meta, alternatives, OG_LOCALE, autreLocale } from "./lib/head";
import { dictionaries } from "./i18n";
import { donneesStructurees } from "./lib/jsonld";
import type { Locale, NomDePage } from "./lib/routes";

export { toutesLesUrls } from "./lib/routes";

export type Rendu = {
  corps: string;
  tete: string;
  titre: string;
  description: string;
  lang: Locale;
  /** `og:locale` et `og:locale:alternate`, au format Open Graph. */
  ogLocale: string;
  ogLocaleAlternate: string;
  /** Le texte alternatif de l'image de partage, dans la langue de la page. */
  ogImageAlt: string;
  /** Les blocs schema.org de la page. Sérialisés par le prérendu, jamais par
   *  un composant : voir lib/jsonld.ts. */
  jsonld: object[];
};

export function rendre(nom: NomDePage, locale: Locale): Rendu {
  router.definir(nom, locale);
  const { body, head } = render(App);
  const { titre, description } = meta(nom, locale);

  const liens = alternatives(nom)
    .map(
      (a) => `<link rel="alternate" hreflang="${a.locale}" href="${a.url}" />`,
    )
    .join("\n    ");

  return {
    corps: body,
    // Pas de canonique ici : prerender.mjs remplace celui du gabarit. L'écrire
    // aux deux endroits en produisait deux, et deux canoniques valent zéro.
    tete: [head, liens].filter(Boolean).join("\n    "),
    titre,
    description,
    lang: locale,
    ogLocale: OG_LOCALE[locale],
    ogLocaleAlternate: OG_LOCALE[autreLocale(locale)],
    ogImageAlt: dictionaries[locale].seo.ogImageAlt,
    jsonld: donneesStructurees(nom, locale),
  };
}
