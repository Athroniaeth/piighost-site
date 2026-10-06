/**
 * Un routeur d'historique en un fichier, conscient de la langue.
 *
 * Sept pages, deux langues, aucune mise en page imbriquée : une dépendance de
 * routage coûterait plus en indirection qu'elle n'apporte. nginx renvoie déjà
 * le bon HTML prérendu pour chaque URL connue, ce qui est tout ce dont un
 * routeur d'historique a besoin.
 *
 * La langue est dans l'URL, pas dans un stockage local. C'est ce qui rend
 * `/fr/projects/api` et `/en/projects/api` indexables séparément, et ce qui
 * permet à `hreflang` de dire la vérité.
 */

import {
  LOCALE_DEFAUT,
  LOCALES,
  type Locale,
  type NomDePage,
  estLocale,
  lienDe,
  reconnaitre,
  traduire,
} from "./routes";
import { charger } from "./blog.svelte";

/** La langue à servir à quelqu'un qui arrive sur `/`, sans rien imposer. */
export function localePreferee(): Locale {
  if (typeof navigator === "undefined") return LOCALE_DEFAUT;
  for (const demandee of navigator.languages ?? [navigator.language]) {
    const base = demandee.slice(0, 2).toLowerCase();
    if (estLocale(base)) return base;
  }
  return LOCALE_DEFAUT;
}

/** Vrai dans un navigateur, faux au prérendu. */
const NAVIGATEUR = typeof window !== "undefined";

class Router {
  nom = $state<NomDePage>("home");
  locale = $state<Locale>(LOCALE_DEFAUT);
  /** Le slug de l'article ouvert, sur la page `blog`. Null sur l'index du
   *  blog et sur toute autre page. */
  article = $state<string | null>(null);
  /** Vraie quand l'URL n'est aucune des quatorze. Le rendu affiche alors la 404. */
  introuvable = $state(false);

  constructor() {
    // Au prérendu il n'y a ni `location` ni `history` : la route est posée par
    // `definir()` avant le rendu. Sans cette garde, le build serveur planterait
    // à l'import, et le prérendu se réduirait à une page vide livrée aux robots.
    if (!NAVIGATEUR) return;
    this.lire();
    addEventListener("popstate", () => this.lire());
  }

  /** Pose la route sans toucher à l'historique. Réservé au prérendu, qui
   *  a déjà chargé le corps de l'article. */
  definir(nom: NomDePage, locale: Locale, article: string | null = null) {
    this.nom = nom;
    this.locale = locale;
    this.article = article;
    this.introuvable = false;
  }

  private lire() {
    const chemin = location.pathname;

    // La racine nue n'est pas une page : elle redirige vers la langue du
    // visiteur, sans jamais la mémoriser.
    if (chemin === "/" || chemin === "") {
      this.aller("home", localePreferee(), { remplacer: true });
      return;
    }

    const trouve = reconnaitre(chemin);
    if (trouve) {
      this.poser(trouve.nom, trouve.locale, trouve.article ?? null);
      return;
    }
    this.introuvable = true;
  }

  /** Change de route. Le corps d'un article se charge en parallèle : la page
   *  montre son titre tout de suite et son texte dès qu'il arrive. */
  private poser(nom: NomDePage, locale: Locale, article: string | null) {
    if (article) void charger(locale, article);
    this.definir(nom, locale, article);
  }

  /** Navigue sans recharger. `remplacer` évite d'empiler la redirection,
   *  `article` ouvre un article de la page `blog`. */
  aller(
    nom: NomDePage,
    locale: Locale = this.locale,
    options: { remplacer?: boolean; article?: string | null } = {},
  ) {
    const article = options.article ?? null;
    if (!NAVIGATEUR) return this.definir(nom, locale, article);
    const url = lienDe({ nom, locale, article: article ?? undefined });
    if (options.remplacer) history.replaceState({}, "", url);
    else history.pushState({}, "", url);
    this.poser(nom, locale, article);
    scrollTo({ top: 0 });
  }

  /** La même page dans l'autre langue, ce qu'attend un sélecteur de langue.
   *  Un article sans traduction mène à l'index du blog. */
  basculerLangue() {
    const autre = LOCALES.find((l) => l !== this.locale) ?? LOCALE_DEFAUT;
    const route = traduire(this.route, autre);
    this.aller(route.nom, route.locale, { article: route.article });
  }

  /** La route en cours, d'un seul tenant. */
  get route() {
    return {
      nom: this.nom,
      locale: this.locale,
      article: this.article ?? undefined,
    };
  }
}

export const router = new Router();

/** Intercepte un clic sur un lien interne pour éviter le rechargement. */
export function naviguer(
  event: MouseEvent,
  nom: NomDePage,
  locale?: Locale,
  article?: string,
) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
    return;
  event.preventDefault();
  router.aller(nom, locale ?? router.locale, { article });
}
