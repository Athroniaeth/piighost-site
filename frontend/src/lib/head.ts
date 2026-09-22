/**
 * Les balises d'en-tête, écrites au même endroit pour le client et le prérendu.
 *
 * Une application à page unique ne change pas son `<title>` toute seule, et un
 * robot qui n'exécute pas le script ne verrait que le repli d'index.html. Ces
 * fonctions servent donc deux fois : le prérendu les appelle au build pour
 * écrire un HTML par route, et le routeur les rappelle à la navigation pour
 * que l'onglet et l'historique disent la vérité.
 */

import { ORIGINE, cheminDe, lien, LOCALES, type Locale, type NomDePage } from "./routes";
import { tr, type Cle } from "./i18n.svelte";

/** Le titre et la description d'une page, dans une langue. */
export function meta(nom: NomDePage, locale: Locale): { titre: string; description: string } {
  const CLES: Record<NomDePage, { titre: Cle; description: Cle }> = {
    home: { titre: "home.title", description: "home.lede" },
    philosophy: { titre: "philosophy.title", description: "philosophy.lede" },
    piighost: { titre: "project.piighost.title", description: "project.piighost.lede" },
    api: { titre: "project.api.title", description: "project.api.lede" },
    chat: { titre: "project.chat.title", description: "project.chat.lede" },
    proofreader: { titre: "project.proofreader.title", description: "project.proofreader.lede" },
  };
  const cle = CLES[nom];
  const brut = tr(locale, cle.titre);
  // Le titre d'un onglet et celui d'un index ne sont pas la même chose : on
  // suffixe, sauf l'accueil dont le titre porte déjà le nom.
  const titre = nom === "home" ? `piighost, ${brut.toLowerCase()}` : `${brut} | piighost`;
  return { titre, description: tr(locale, cle.description) };
}

/** L'adresse canonique d'une page. */
export const canonique = (nom: NomDePage, locale: Locale) => `${ORIGINE}${lien(nom, locale)}`;

/** Les variantes de langue, ce que `hreflang` doit annoncer. */
export function alternatives(nom: NomDePage): { locale: Locale | "x-default"; url: string }[] {
  const chemin = cheminDe(nom);
  return [
    ...LOCALES.map((l) => ({ locale: l, url: canonique(nom, l) })),
    { locale: "x-default" as const, url: `${ORIGINE}${chemin === "/" ? "/" : chemin}` },
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
