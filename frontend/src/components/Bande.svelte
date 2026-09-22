<script lang="ts">
  /**
   * L'étiquette de section : mono, capitales, interlettrée, sur fond teinté,
   * pleine largeur. C'est le séparateur de la maquette validée, pas un titre
   * centré avec du vide autour.
   */
  let { children }: { children: import("svelte").Snippet } = $props();
</script>

<p
  class="border-t bg-muted px-5 py-2.5 font-mono text-[0.625rem] tracking-[0.12em] text-muted-foreground uppercase"
>
  {@render children()}
</p>
