/**
 * Refermer un `details` quand on clique à côté.
 *
 * Le navigateur gère seul l'ouverture au clavier, la fermeture par Échap et le
 * repli sans script : c'est pour cela que les menus du site sont des `details`
 * plutôt que du JavaScript. La seule chose qu'il ne fait pas est se refermer
 * sur un clic ailleurs dans la page, et un menu de navigation qui reste déplié
 * par-dessus le contenu est le défaut que tout le monde remarque.
 *
 * `pointerdown` en phase de capture, et non `click` : si le clic tombe sur un
 * lien, la navigation part avant la phase de remontée, et le menu se rouvrirait
 * — ou resterait ouvert — sur la page suivante.
 */
export function fermerAuClicDehors(menu: HTMLDetailsElement): () => void {
  const fermer = (event: Event) => {
    if (menu.open && !menu.contains(event.target as Node)) menu.open = false;
  };
  document.addEventListener("pointerdown", fermer, true);
  return () => document.removeEventListener("pointerdown", fermer, true);
}
