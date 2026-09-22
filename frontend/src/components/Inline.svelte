<script lang="ts">
  /**
   * Un paragraphe du dictionnaire où les passages entre accents graves
   * deviennent du code. C'est la seule mise en forme que la copie porte, et
   * elle reste du texte dans le fichier de traduction.
   */
  let { texte }: { texte: string } = $props();

  const morceaux = $derived(
    texte.split(/(`[^`]+`)/g).map((part) => ({
      code: part.startsWith("`") && part.endsWith("`") && part.length > 2,
      texte:
        part.startsWith("`") && part.endsWith("`") && part.length > 2
          ? part.slice(1, -1)
          : part,
    })),
  );
</script>

{#each morceaux as morceau, i (i)}{#if morceau.code}<code
      class="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
      >{morceau.texte}</code
    >{:else}{morceau.texte}{/if}{/each}
