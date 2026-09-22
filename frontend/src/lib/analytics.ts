/**
 * Ce que le site rapporte à un OpenPanel auto hébergé, et rien d'autre.
 *
 * Le jeu d'événements est fermé volontairement. Chaque propriété est une forme,
 * un compte ou une durée ; aucune ne peut transporter un texte saisi par un
 * visiteur. Ajouter une clé qui le pourrait suppose de changer ce type, dans
 * une modification que quelqu'un relit.
 *
 * Le SDK est empaqueté plutôt que chargé depuis openpanel.dev, et les
 * événements partent vers un chemin de même origine que nginx relaie. Deux
 * conséquences : la CSP reste `script-src 'self'; connect-src 'self'`, et un
 * bloqueur qui filtre openpanel.dev n'a rien à filtrer, donc les chiffres ne
 * manquent pas silencieusement d'une part des visiteurs.
 *
 * Reporté du hub, où ce raisonnement a déjà été tenu.
 */

import { OpenPanel } from "@openpanel/web";
import type { Locale, NomDePage } from "./routes";

export type AnalyticsEvent =
  | { name: "page_view"; props: { page: NomDePage; locale: Locale } }
  | { name: "language_switched"; props: { from: Locale; to: Locale } }
  | { name: "theme_toggled"; props: { to: "light" | "dark" } }
  | { name: "outbound"; props: { destination: string; page: NomDePage } }
  | { name: "install_copied"; props: { page: NomDePage } };

/** Même origine, relayé par nginx : rien qu'un bloqueur puisse reconnaître. */
const API_URL = "/api/op";

let panel: OpenPanel | null = null;

export function initAnalytics(clientId: string | undefined) {
  if (!clientId || panel) return;
  panel = new OpenPanel({
    clientId,
    apiUrl: API_URL,
    // Tout est désactivé et déclaré, plutôt que laissé au défaut.
    //
    // `sessionReplay` d'abord, et c'est le point qui compte : un produit dont
    // l'argument est que les données ne sortent pas ne peut pas filmer l'écran
    // de ses visiteurs. Le SDK charge son enregistreur par un `await import()`,
    // donc les 178 Ko du morceau ne partent chez personne tant que l'option est
    // fausse, mais un défaut subi n'est pas une décision.
    sessionReplay: { enabled: false },
    // Les vues de page et les liens sortants sont émis à la main, par des
    // événements typés que l'on relit. Laisser le SDK les deviner ferait entrer
    // des propriétés que le type AnalyticsEvent ne décrit pas.
    trackScreenViews: false,
    trackOutgoingLinks: false,
    trackAttributes: false,
  });
}

export function track<E extends AnalyticsEvent>(event: E) {
  panel?.track(event.name, event.props);
}
