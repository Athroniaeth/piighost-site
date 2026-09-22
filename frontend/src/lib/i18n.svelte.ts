/**
 * L'accès au dictionnaire, réactif à la langue de l'URL.
 *
 * Un accesseur plutôt qu'une valeur exportée : `router.locale` est un état, et
 * une constante figée au chargement du module ne changerait jamais.
 */
import { dictionaries } from "../i18n";
import type { Dictionary } from "../i18n";
import { router } from "./router.svelte";

class I18n {
  get t(): Dictionary {
    return dictionaries[router.locale];
  }
  get locale() {
    return router.locale;
  }
}

export const i18n = new I18n();
