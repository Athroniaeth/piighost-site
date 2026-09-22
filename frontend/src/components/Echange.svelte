<script lang="ts">
  import Segments from "./Segments.svelte";
  import { untrack } from "svelte";
  import { Flux, type Entite, type Segment } from "../lib/flux.svelte";

  /**
   * Une boîte étiquetée dont le contenu bascule entre valeurs et jetons.
   *
   * L'étiquette change avec le contenu : la même boîte est « ce que l'usager
   * écrit » puis « ce que le modèle voit ». C'est ce glissement qui dit que
   * les deux sont le même message.
   */
  let {
    entites,
    segments,
    etiquetteBrute,
    etiquetteJeton,
    demarreEnJetons = false,
  }: {
    entites: Entite[];
    segments: Segment[];
    etiquetteBrute: string;
    etiquetteJeton: string;
    demarreEnJetons?: boolean;
  } = $props();

  const flux = untrack(() => new Flux(entites.length, demarreEnJetons));
  $effect(() => flux.demarrer());
</script>

<div class="rounded-lg border bg-card p-4 shadow-sm">
  <p
    class="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors duration-500"
  >
    {flux.enJetons ? etiquetteJeton : etiquetteBrute}
  </p>
  <p class="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
    <Segments
      {entites}
      {segments}
      remplacees={flux.remplacees}
      battement={flux.battement}
    />
  </p>
</div>
