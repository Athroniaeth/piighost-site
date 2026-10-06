<script lang="ts">
  /**
   * Les étiquettes d'un article, en police machine et en gris.
   *
   * Une étiquette n'est pas une donnée détectée : elle ne prend donc ni une
   * teinte d'entité ni la couleur primaire, réservée à l'élément actif.
   */
  let { tags, label }: { tags: string[]; label: string } = $props();
</script>

{#if tags.length}
  <ul aria-label={label} class="flex flex-wrap gap-2">
    {#each tags as tag (tag)}
      <li
        class="rounded-lg border px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
      >
        {tag}
      </li>
    {/each}
  </ul>
{/if}
