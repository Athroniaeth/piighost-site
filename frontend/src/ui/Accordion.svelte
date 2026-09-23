<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import Minus from "@lucide/svelte/icons/minus";
  import type { Snippet } from "svelte";
  import { cn } from "../lib/cn";

  /**
   * Un accordéon bâti sur `details` et `summary`.
   *
   * Le navigateur donne l'ouverture au clavier, la fermeture, et la recherche
   * dans la page qui déplie la bonne section. Un accordéon en JavaScript perd
   * les trois, et une réponse de FAQ doit rester trouvable, y compris par un
   * robot qui n'exécute rien.
   *
   * Question alignée à gauche, signe à droite : centrée, la question
   * s'éloignait de son signe d'ouverture d'autant plus qu'elle était courte.
   */
  let {
    items,
    class: extra = "",
    triggerClass = "",
    contentClass = "",
    ouvert = undefined,
    contenu,
  }: {
    items: { question: string }[];
    class?: string;
    triggerClass?: string;
    contentClass?: string;
    /** L'index de l'élément ouvert au chargement. */
    ouvert?: number;
    contenu: Snippet<[number]>;
  } = $props();
</script>

<div class={cn("flex w-full flex-col border-y", extra)}>
  {#each items as item, i (item.question)}
    <details class="group not-last:border-b" open={i === ouvert}>
      <summary
        class={cn(
          "flex cursor-pointer list-none items-center gap-6 rounded-lg border border-transparent py-4",
          "text-left font-medium transition-all outline-none hover:underline",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          triggerClass,
        )}
      >
        <span class="flex-1">{item.question}</span>
        <Plus class="size-4 shrink-0 text-muted-foreground group-open:hidden" />
        <Minus class="hidden size-4 shrink-0 text-primary group-open:block" />
      </summary>
      <div
        class={cn(
          "-mt-1 pb-5 text-[0.9375rem] leading-relaxed [&_a]:underline [&_a]:underline-offset-3",
          contentClass,
        )}
      >
        {@render contenu(i)}
      </div>
    </details>
  {/each}
</div>
