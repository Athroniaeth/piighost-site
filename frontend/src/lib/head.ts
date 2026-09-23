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
  lien,
  LOCALES,
  LOCALE_DEFAUT,
  type Locale,
  type NomDePage,
} from "./routes";
import { dictionaries } from "../i18n";
import type { Dictionary } from "../i18n";

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
  philosophy: (t) => ({
    titre: `${t.philosophy.title} - piighost`,
    description: t.seo.philosophyDescription,
  }),
};

/** Le titre et la description d'une page, dans une langue. */
export function meta(
  nom: NomDePage,
  locale: Locale,
): { titre: string; description: string } {
  return PAGES[nom](dictionaries[locale]);
}

/** L'adresse canonique d'une page. */
export const canonique = (nom: NomDePage, locale: Locale) =>
  `${ORIGINE}${lien(nom, locale)}`;

/** Les variantes de langue, ce que `hreflang` doit annoncer.
 *
 *  `x-default` vise la langue par défaut, pas une URL sans préfixe : ces
 *  dernières ne sont servies par personne, et un hreflang qui pointe vers une
 *  404 est pire que pas de hreflang du tout. */
export function alternatives(
  nom: NomDePage,
): { locale: Locale | "x-default"; url: string }[] {
  return [
    ...LOCALES.map((l) => ({ locale: l, url: canonique(nom, l) })),
    { locale: "x-default" as const, url: canonique(nom, LOCALE_DEFAUT) },
  ];
}

/** Applique les balises au document courant. Sans effet au prérendu. */
export function appliquer(nom: NomDePage, locale: Locale) {
  if (typeof document === "undefined") return;
  const { titre, description } = meta(nom, locale);
  document.title = titre;
  document.documentElement.lang = locale;
  poser("meta[name='description']", "content", description);
  poser("link[rel='canonical']", "href", canonique(nom, locale));
  poser("meta[property='og:title']", "content", titre);
  poser("meta[property='og:description']", "content", description);
  poser("meta[property='og:url']", "content", canonique(nom, locale));
}

function poser(selecteur: string, attribut: string, valeur: string) {
  document.querySelector(selecteur)?.setAttribute(attribut, valeur);
}
