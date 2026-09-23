<script lang="ts">
  import { pythonTokens } from "../lib/highlight";
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
   */
  let {
    code,
    onglets,
    class: extra = "",
  }: {
    code: string;
    /** Les onglets, le premier est l'actif. */
    onglets: Snippet;
    class?: string;
  } = $props();

  const jetons = $derived(pythonTokens(code));
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
  <pre
    class="overflow-x-auto p-5 font-mono text-[0.8125rem] leading-[1.75]"><code
      >{#each jetons as jeton, index (index)}<span class="tok-{jeton.kind}"
          >{jeton.text}</span
        >{/each}</code
    ></pre>
</div>
