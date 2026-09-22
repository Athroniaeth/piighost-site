/**
 * Clair par défaut, sombre sur demande, mémorisé.
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
    this.dark = document.documentElement.classList.contains("dark");
  }

  toggle() {
    this.dark = !this.dark;
    localStorage.setItem(STORAGE_KEY, this.dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", this.dark);
  }
}

export const theme = new Theme();
