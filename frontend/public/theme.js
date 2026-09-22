/* Pose la classe .dark avant le premier rendu, sinon la page clignote en clair
 * puis bascule. Un fichier séparé et non un script en ligne : la CSP de
 * production est `script-src 'self'` sans `unsafe-inline`, un bloc en ligne
 * serait refusé par le navigateur et le clignotement reviendrait en silence.
 * Volontairement sans module ni defer : il doit s'exécuter avant la peinture. */
(function () {
  try {
    if (localStorage.getItem("piighost-theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (_) {
    /* stockage refusé, navigation privée stricte : on reste en clair. */
  }
})();
