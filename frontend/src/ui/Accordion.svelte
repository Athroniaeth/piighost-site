<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronUp from "@lucide/svelte/icons/chevron-up";
  import type { Snippet } from "svelte";
  import { cn } from "../lib/cn";

  /**
   * Un accordéon bâti sur `details` et `summary`.
   *
   * Le navigateur donne l'ouverture au clavier, la fermeture, et la recherche
   * dans la page qui déplie la bonne section. Un accordéon en JavaScript perd
   * les trois, et une réponse de FAQ doit rester trouvable, y compris par un
   * robot qui n'exécute rien.
   */
  let {
    items,
    class: extra = "",
    triggerClass = "",
    contentClass = "",
    contenu,
  }: {
    items: { question: string }[];
    class?: string;
    triggerClass?: string;
    contentClass?: string;
    contenu: Snippet<[number]>;
  } = $props();
</script>

<div class={cn("flex w-full flex-col", extra)}>
  {#each items as item, i (item.question)}
    <details class="group not-last:border-b">
      <summary
        class={cn(
          "flex cursor-pointer list-none items-center gap-3 rounded-lg border border-transparent py-2.5",
          "text-left font-medium transition-all outline-none hover:underline",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          triggerClass,
        )}
      >
        <span aria-hidden="true" class="w-4 shrink-0"></span>
        <span class="flex-1 text-center">{item.question}</span>
        <ChevronDown
          class="size-4 shrink-0 text-muted-foreground group-open:hidden"
        />
        <ChevronUp
          class="hidden size-4 shrink-0 text-muted-foreground group-open:block"
        />
      </summary>
      <div
        class={cn(
          "pt-0 pb-2.5 text-sm [&_a]:underline [&_a]:underline-offset-3",
          contentClass,
        )}
      >
        {@render contenu(i)}
      </div>
    </details>
  {/each}
</div>
