/**
 * La forme du site, dérivée de routes.json.
 *
 * Ce module ne décide de rien : il type et il calcule. La liste elle-même vit
 * à la racine du dépôt, parce que le sitemap Python et le prérendu la lisent
 * aussi. Ajouter une page ici sans la déclarer là serait une page que les
 * robots ne trouvent pas.
 */

import donnees from "../../../routes.json";

/** Les unions sont écrites ici, pas dérivées du JSON.
 *
 *  Un import JSON ne porte pas de types littéraux : `donnees.locales` est un
 *  `string[]`, donc un type dérivé vaudrait `string` et n'attraperait plus
 *  aucune faute de frappe. Le contrôle plus bas garantit que ces unions et le
 *  fichier disent la même chose. */
export type Locale = "fr" | "en";
export type NomDePage =
  | "home"
  | "piighost"
  | "api"
  | "chat"
  | "proofreader"
  | "philosophy";

export type Page = { nom: NomDePage; chemin: string; priorite: number; frequence: string };

export const LOCALES = donnees.locales as readonly Locale[];
export const LOCALE_DEFAUT = donnees.localeParDefaut as Locale;
export const ORIGINE = donnees.origine;
export const PAGES = donnees.pages as readonly Page[];

/** Échoue au chargement si routes.json et les unions ont divergé.
 *
 *  Ce n'est pas de la paranoïa : le même fichier est lu par le sitemap Python
 *  et par le prérendu, et une page ajoutée d'un seul côté est une page que les
 *  robots ne trouvent pas. Mieux vaut un module qui refuse de se charger qu'un
 *  site qui perd une URL en silence. */
const NOMS_ATTENDUS: readonly NomDePage[] = [
  "home",
  "piighost",
  "api",
  "chat",
  "proofreader",
  "philosophy",
];
{
  const dansLeFichier = PAGES.map((p) => p.nom).sort();
  const attendus = [...NOMS_ATTENDUS].sort();
  if (JSON.stringify(dansLeFichier) !== JSON.stringify(attendus)) {
    throw new Error(
      `routes.json et routes.ts ont divergé : ${dansLeFichier.join(", ")} ` +
        `contre ${attendus.join(", ")}`,
    );
  }
}

export function estLocale(valeur: string): valeur is Locale {
  return (LOCALES as readonly string[]).includes(valeur);
}

/** L'URL d'une page dans une langue : `/fr/projects/api`. */
export function lien(nom: NomDePage, locale: Locale): string {
  const page = PAGES.find((p) => p.nom === nom);
  if (!page) throw new Error(`page inconnue : ${nom}`);
  return page.chemin === "/" ? `/${locale}` : `/${locale}${page.chemin}`;
}

/** Le chemin sans la langue, pour les balises hreflang et le canonique. */
export function cheminDe(nom: NomDePage): string {
  const page = PAGES.find((p) => p.nom === nom);
  if (!page) throw new Error(`page inconnue : ${nom}`);
  return page.chemin;
}

/** Toutes les URL du site, dans toutes les langues. Sert au prérendu. */
export function toutesLesUrls(): { url: string; nom: NomDePage; locale: Locale }[] {
  return LOCALES.flatMap((locale) =>
    PAGES.map((p) => ({ url: lien(p.nom, locale), nom: p.nom, locale })),
  );
}

/** Reconnaît une URL. Renvoie null si elle n'appartient pas au site. */
export function reconnaitre(chemin: string): { nom: NomDePage; locale: Locale } | null {
  const segments = chemin.replace(/\/+$/, "").split("/").filter(Boolean);
  const [premier, ...reste] = segments;
  if (!premier || !estLocale(premier)) return null;
  const sousChemin = "/" + reste.join("/");
  const page = PAGES.find((p) => p.chemin === (reste.length ? sousChemin : "/"));
  return page ? { nom: page.nom, locale: premier } : null;
}
