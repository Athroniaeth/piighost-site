<script lang="ts">
  import CopyButton from "../ui/CopyButton.svelte";
  import { pythonTokens, shellTokens, type Token } from "../lib/highlight";
  import { cn } from "../lib/cn";
  import type { Snippet } from "svelte";

  /**
   * Une fenêtre d'éditeur, sombre, avec sa barre d'onglets.
   *
   * Sombre par la classe `dark` et non par des couleurs écrites ici : elle
   * reprend donc les valeurs du mode sombre de la charte, coloration syntaxique
   * comprise, et suivra toute régénération des tokens.
   *
   * La coloration passe par le tokeniseur du site, pas par un balisage écrit à
   * la main : ce qui est affiché est vraiment du Python analysé, et un extrait
   * qu'on modifie se recolore tout seul.
   *
   * Deux options servent au démarrage rapide : une ligne de terminal en tête,
   * copiable, et des lignes marquées, celles qu'apporte piighost, pour montrer
   * que le reste du code d'agent ne change pas.
   */
  let {
    code,
    onglets,
    commande = undefined,
    ajouts = [],
    class: extra = "",
  }: {
    code: string;
    /** Les onglets, le premier est l'actif. */
    onglets: Snippet;
    /** Une commande shell affichée au-dessus du code. */
    commande?: string;
    /** Les numéros des lignes marquées, à partir de 1. */
    ajouts?: number[];
    class?: string;
  } = $props();

  /** Les jetons rangés par ligne : un jeton qui porte un retour à la ligne
   *  est coupé en deux, pour que chaque ligne puisse être marquée seule. */
  const lignes = $derived.by(() => {
    const sortie: Token[][] = [[]];
    for (const jeton of pythonTokens(code)) {
      jeton.text.split("\n").forEach((morceau, i) => {
        if (i > 0) sortie.push([]);
        if (morceau)
          sortie[sortie.length - 1].push({ ...jeton, text: morceau });
      });
    }
    return sortie;
  });
  const marquees = $derived(new Set(ajouts));
</script>

<div
  class={cn(
    "dark overflow-hidden rounded-xl border border-foreground/25 bg-card text-card-foreground shadow-xl",
    extra,
  )}
>
  <div class="flex border-b border-foreground/15 bg-foreground/5">
    {@render onglets()}
  </div>
  {#if commande}
    <div
      class="flex items-center gap-2 border-b border-foreground/15 py-1.5 pl-5 pr-2 font-mono text-[0.8125rem]"
    >
      <span class="text-muted-foreground" aria-hidden="true">$</span>
      <code class="min-w-0 flex-1 overflow-x-auto whitespace-nowrap"
        >{#each shellTokens(commande) as jeton, index (index)}<span
            class="tok-{jeton.kind}">{jeton.text}</span
          >{/each}</code
      >
      <CopyButton value={commande} class="size-7" />
    </div>
  {/if}
  <pre
    class="overflow-x-auto py-5 font-mono text-[0.8125rem] leading-[1.75]"><code
      class="inline-block min-w-full"
      >{#each lignes as ligne, n (n)}<span
          class={[
            "block px-5",
            marquees.has(n + 1) &&
              "bg-primary/15 shadow-[inset_3px_0_0_var(--primary)]",
          ]}
          >{#each ligne as jeton, index (index)}<span class="tok-{jeton.kind}"
              >{jeton.text}</span
            >{/each}{#if ligne.length === 0}{" "}{/if}</span
        >{/each}</code
    ></pre>
</div>
