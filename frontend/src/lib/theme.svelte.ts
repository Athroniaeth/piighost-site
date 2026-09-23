/**
 * Sombre par défaut, clair sur demande, mémorisé.
 *
 * La préférence du système est ignorée volontairement : un site vitrine et ses
 * outils doivent se ressembler sur une capture d'écran et sur l'écran du
 * visiteur. C'est aussi une contrainte de la charte.
 *
 * La classe est posée sur <html> avant l'hydratation par un script en ligne
 * dans index.html, sinon la page clignote en clair avant de passer en sombre.
 */

const STORAGE_KEY = "piighost-theme";

class Theme {
  dark = $state(false);

  constructor() {
    // Au prérendu il n'y a pas de document : on reste en clair, qui est le
    // mode par défaut, et le script de démarrage corrige avant la peinture.
    if (typeof document === "undefined") return;
    this.dark = document.documentElement.classList.contains("dark");
  }

  toggle() {
    if (typeof document === "undefined") return;
    this.dark = !this.dark;
    localStorage.setItem(STORAGE_KEY, this.dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", this.dark);
  }
}

export const theme = new Theme();
