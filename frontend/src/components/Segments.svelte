<script lang="ts">
  import { classeDe } from "../lib/entites";
  import { estTexte, type Entite, type Segment } from "../lib/flux.svelte";
  import { cn } from "../lib/cn";

  /**
   * Une phrase dont les valeurs sensibles basculent en jetons.
   *
   * La teinte dit la catégorie, l'intensité dit l'état : pâle tant que la
   * valeur est en clair, renforcé une fois remplacée par son jeton. Le
   * battement se pose en `--foreground`, pas en couleur d'accent : c'est une
   * marque d'attention passagère, pas une catégorie de plus.
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
        classeDe(entite.jeton, masquee ? "jeton" : "valeur"),
        battement === segment.entite
          ? "scale-[1.04] ring-1 ring-foreground/30"
          : "scale-100",
      )}>{masquee ? entite.jeton : entite.brut}</span
    >{/if}
{/each}
