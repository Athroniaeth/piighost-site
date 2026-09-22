<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "../lib/cn";

  /**
   * Les onglets du site : une liste de déclencheurs et un panneau.
   *
   * De vrais boutons avec les rôles ARIA, pas des div cliquables : les flèches
   * du clavier et les lecteurs d'écran en dépendent.
   */
  let {
    onglets,
    actif = $bindable(),
    class: extra = "",
    listClass = "",
    children,
  }: {
    onglets: { id: string; label: string }[];
    actif: string;
    class?: string;
    listClass?: string;
    children: Snippet<[string]>;
  } = $props();

  function auClavier(event: KeyboardEvent) {
    const i = onglets.findIndex((o) => o.id === actif);
    if (event.key === "ArrowRight")
      actif = onglets[(i + 1) % onglets.length].id;
    else if (event.key === "ArrowLeft")
      actif = onglets[(i - 1 + onglets.length) % onglets.length].id;
    else return;
    event.preventDefault();
  }
</script>

<div class={cn(extra)}>
  <div
    role="tablist"
    class={cn("grid w-full gap-1 rounded-lg bg-muted p-1", listClass)}
  >
    {#each onglets as onglet (onglet.id)}
      <button
        type="button"
        role="tab"
        id="onglet-{onglet.id}"
        aria-selected={actif === onglet.id}
        aria-controls="panneau-{onglet.id}"
        tabindex={actif === onglet.id ? 0 : -1}
        onclick={() => (actif = onglet.id)}
        onkeydown={auClavier}
        class={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none",
          "focus-visible:ring-3 focus-visible:ring-ring/50",
          actif === onglet.id
            ? "bg-background text-foreground shadow-none"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {onglet.label}
      </button>
    {/each}
  </div>

  <div role="tabpanel" id="panneau-{actif}" aria-labelledby="onglet-{actif}">
    {@render children(actif)}
  </div>
</div>
