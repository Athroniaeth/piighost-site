import { hydrate, mount } from "svelte";
import App from "./App.svelte";
import "./app.css";
import "./studio.css";
import { initAnalytics } from "./lib/analytics";

const target = document.getElementById("app");
if (!target) throw new Error("Root element #app not found");

// L'identifiant est injecté au build. Absent, la mesure d'audience ne démarre
// pas : un développement local ne pollue pas les chiffres de production.
initAnalytics(import.meta.env.VITE_OPENPANEL_CLIENT_ID);

// Les pages sont prérendues, donc la cible contient déjà le balisage :
// `hydrate` reprend cet arbre au lieu de le jeter. Sur une URL inconnue, que
// nginx sert avec l'index de repli, il n'y a rien à reprendre et on monte.
export default target.firstChild
  ? hydrate(App, { target })
  : mount(App, { target });
