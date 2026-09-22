import { mount } from "svelte";
import App from "./App.svelte";
import "./app.css";
import { initAnalytics } from "./lib/analytics";

const target = document.getElementById("app");
if (!target) throw new Error("Root element #app not found");

// L'identifiant est injecté au build. Absent, la mesure d'audience ne démarre
// pas : un développement local ne pollue pas les chiffres de production.
initAnalytics(import.meta.env.VITE_OPENPANEL_CLIENT_ID);

export default mount(App, { target });
