/**
 * Le blog côté application : la liste des articles et leurs corps.
 *
 * La liste est petite et toujours là. Le corps d'un article est un morceau
 * de bundle à part, chargé quand on l'ouvre. Le prérendu et l'hydratation
 * l'attendent avant de rendre la page (voir entry-server.ts et main.ts), la
 * navigation dans le site l'affiche dès qu'il arrive.
 */

import { ARTICLES, CHARGEURS } from "virtual:blog";
import { SvelteMap } from "svelte/reactivity";
import type { ContentNode } from "@piighost/ui/content";
import type { ArticleMeta } from "../../blog/build";
import type { Locale } from "./routes";

export type { ArticleMeta };

/** Les articles d'une langue, le plus récent d'abord. */
export const articlesDe = (locale: Locale): ArticleMeta[] =>
  ARTICLES.filter((a) => a.lang === locale);

/** Tous les articles publiés, pour le prérendu. */
export const tousLesArticles = (): readonly ArticleMeta[] => ARTICLES;

/** Un article dans une langue, ou undefined s'il n'y est pas publié. */
export const trouver = (
  locale: Locale,
  slug: string,
): ArticleMeta | undefined =>
  ARTICLES.find((a) => a.lang === locale && a.slug === slug);

/** L'adresse d'un article : `/fr/blog/<slug>`. */
export const lienArticle = (locale: Locale, slug: string) =>
  `/${locale}/blog/${slug}`;

/** L'adresse du flux Atom d'une langue. */
export const lienFlux = (locale: Locale) => `/${locale}/blog/feed.xml`;

const cle = (locale: Locale, slug: string) => `${locale}/${slug}`;
const corps = new SvelteMap<string, ContentNode[]>();
// Une attente en cours n'a pas à être réactive : rien ne s'affiche d'après elle.
// eslint-disable-next-line svelte/prefer-svelte-reactivity
const enCours = new Map<string, Promise<void>>();

/** Le corps d'un article, s'il est déjà chargé. */
export const contenu = (locale: Locale, slug: string) =>
  corps.get(cle(locale, slug));

/** Charge le corps d'un article. Deux appels pour le même partagent la même
 *  attente. Un article inconnu ne charge rien. */
export function charger(locale: Locale, slug: string): Promise<void> {
  const k = cle(locale, slug);
  const chargeur = CHARGEURS[k];
  if (!chargeur || corps.has(k)) return Promise.resolve();
  let attente = enCours.get(k);
  if (!attente) {
    attente = chargeur().then((module) => {
      corps.set(k, module.default);
      enCours.delete(k);
    });
    enCours.set(k, attente);
  }
  return attente;
}

/** Une date `AAAA-MM-JJ` écrite pour un lecteur, dans sa langue. Lue en UTC,
 *  sinon un fuseau à l'ouest de Greenwich afficherait la veille, et le
 *  prérendu et le navigateur ne diraient pas la même chose. */
export function dateLisible(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(Date.parse(`${date}T00:00:00Z`));
}
