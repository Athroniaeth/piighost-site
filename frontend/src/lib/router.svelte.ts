/**
 * Un routeur d'historique en un fichier, conscient de la langue.
 *
 * Six pages, deux langues, aucune mise en page imbriquée : une dépendance de
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
  lien,
  reconnaitre,
} from "./routes";

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
  /** Vraie quand l'URL n'est aucune des douze. Le rendu affiche alors la 404. */
  introuvable = $state(false);

  constructor() {
    // Au prérendu il n'y a ni `location` ni `history` : la route est posée par
    // `definir()` avant le rendu. Sans cette garde, le build serveur planterait
    // à l'import, et le prérendu se réduirait à une page vide livrée aux robots.
    if (!NAVIGATEUR) return;
    this.lire();
    addEventListener("popstate", () => this.lire());
  }

  /** Pose la route sans toucher à l'historique. Réservé au prérendu. */
  definir(nom: NomDePage, locale: Locale) {
    this.nom = nom;
    this.locale = locale;
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
      this.nom = trouve.nom;
      this.locale = trouve.locale;
      this.introuvable = false;
      return;
    }
    this.introuvable = true;
  }

  /** Navigue sans recharger. `remplacer` évite d'empiler la redirection. */
  aller(
    nom: NomDePage,
    locale: Locale = this.locale,
    options: { remplacer?: boolean } = {},
  ) {
    if (!NAVIGATEUR) return this.definir(nom, locale);
    const url = lien(nom, locale);
    if (options.remplacer) history.replaceState({}, "", url);
    else history.pushState({}, "", url);
    this.nom = nom;
    this.locale = locale;
    this.introuvable = false;
    scrollTo({ top: 0 });
  }

  /** La même page dans l'autre langue, ce qu'attend un sélecteur de langue. */
  basculerLangue() {
    const autre = LOCALES.find((l) => l !== this.locale) ?? LOCALE_DEFAUT;
    this.aller(this.nom, autre);
  }
}

export const router = new Router();

/** Intercepte un clic sur un lien interne pour éviter le rechargement. */
export function naviguer(event: MouseEvent, nom: NomDePage, locale?: Locale) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
    return;
  event.preventDefault();
  router.aller(nom, locale ?? router.locale);
}
