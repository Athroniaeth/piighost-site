<script lang="ts">
  import type { Snippet } from "svelte";
  import { naviguer, router } from "../lib/router.svelte";
  import { lien, type Locale, type NomDePage } from "../lib/routes";
  import { cn } from "../lib/cn";

  /**
   * Un lien interne qui reste un lien.
   *
   * Le `href` est écrit en clair et le clic est seulement intercepté : le clic
   * du milieu, l'ouverture dans un onglet et les robots fonctionnent donc
   * comme sur n'importe quel site. Un `<span>` cliquable perdrait les trois.
   */
  let {
    vers,
    locale,
    class: extra = "",
    actif = false,
    children,
    ...rest
  }: {
    vers: NomDePage;
    locale?: Locale;
    class?: string;
    actif?: boolean;
    children: Snippet;
    [key: string]: unknown;
  } = $props();

  const cible = $derived(locale ?? router.locale);
  const estActif = $derived(actif || router.nom === vers);
</script>

<a
  href={lien(vers, cible)}
  class={cn(extra)}
  aria-current={estActif ? "page" : undefined}
  onclick={(e) => naviguer(e, vers, cible)}
  {...rest}
>
  {@render children()}
</a>
