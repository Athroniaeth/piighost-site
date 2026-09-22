<script lang="ts">
  import type { Snippet } from "svelte";

  /**
   * Une ligne de liste dense : pastille, libellé, code aligné à droite.
   * C'est la grammaire du panneau « entités détectées » de la maquette, celle
   * qui fait lire une page comme une mesure et non comme une plaquette.
   */
  let {
    puce = null,
    code = null,
    href = null,
    children,
  }: { puce?: string | null; code?: string | null; href?: string | null; children: Snippet } =
    $props();
</script>

<svelte:element
  this={href ? "a" : "div"}
  {href}
  class="flex items-center gap-2.5 border-t py-2 text-[0.8125rem] first:border-t-0
         {href ? 'outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50' : ''}"
>
  {#if puce}<span class="size-2 shrink-0 rounded-[2px] {puce}"></span>{/if}
  {@render children()}
  {#if code}<code class="ml-auto shrink-0 font-mono text-[0.6875rem] text-muted-foreground">{code}</code>{/if}
</svelte:element>
