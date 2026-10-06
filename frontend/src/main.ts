import { hydrate, mount } from "svelte";
import App from "./App.svelte";
import "./app.css";
import { initAnalytics } from "./lib/analytics";
import { router } from "./lib/router.svelte";
import { charger } from "./lib/blog.svelte";

const target = document.getElementById("app");
if (!target) throw new Error("Root element #app not found");

// L'identifiant est injecté au build. Absent, la mesure d'audience ne démarre
// pas : un développement local ne pollue pas les chiffres de production.
initAnalytics(import.meta.env.VITE_OPENPANEL_CLIENT_ID);

// Le corps d'un article est un module à part. Il est chargé avant
// l'hydratation, sinon le premier rendu du client serait vide là où le HTML
// prérendu porte le texte, et l'article disparaîtrait à l'hydratation.
if (router.article) await charger(router.locale, router.article);

// Les pages sont prérendues, donc la cible contient déjà le balisage :
// `hydrate` reprend cet arbre au lieu de le jeter. Sur une URL inconnue, que
// nginx sert avec l'index de repli, il n'y a rien à reprendre et on monte.
export default target.firstChild
  ? hydrate(App, { target })
  : mount(App, { target });
