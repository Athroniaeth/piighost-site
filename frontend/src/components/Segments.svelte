<script lang="ts">
  import { estTexte, type Entite, type Segment } from "../lib/flux.svelte";
  import { cn } from "../lib/cn";

  /**
   * Une phrase dont les valeurs sensibles basculent en jetons.
   *
   * Ambre tant que la valeur est en clair, couleur d'accent une fois remplacée
   * par son jeton : c'est le codage du studio, repris tel quel.
   */
  let {
    entites,
    segments,
    remplacees,
    battement = null,
  }: {
    entites: Entite[];
    segments: Segment[];
    remplacees: number;
    battement?: number | null;
  } = $props();
</script>

{#each segments as segment, i (i)}
  {#if estTexte(segment)}<span>{segment.texte}</span>{:else}
    {@const entite = entites[segment.entite]}
    {@const masquee = segment.entite < remplacees}
    <span
      class={cn(
        "inline-block rounded px-1 transition-all duration-500 ease-in-out",
        masquee
          ? "bg-primary/10 text-primary"
          : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
        battement === segment.entite
          ? "scale-[1.04] ring-1 ring-primary/40"
          : "scale-100",
      )}>{masquee ? entite.jeton : entite.brut}</span
    >{/if}
{/each}
