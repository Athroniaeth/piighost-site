<script lang="ts">
  import type { Snippet } from "svelte";
  import StepChip from "../ui/StepChip.svelte";

  /**
   * Un panneau de la maquette : bordure de 1 px, petit rayon, aucune ombre,
   * chapeau en mono capitales avec une pastille numérotée facultative.
   *
   * Pas d'ombre portée et pas de grand rayon : le brief les range dans ce qui
   * fait « vibe codé », et le système est du côté de l'arête.
   */
  let {
    etape = null,
    titre,
    children,
  }: { etape?: number | null; titre: string; children: Snippet } = $props();
</script>

<section class="rounded-lg border bg-card p-4">
  <div class="mb-3 flex items-center gap-2">
    {#if etape !== null}<StepChip n={etape} />{/if}
    <h3 class="font-mono text-[0.625rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
      {titre}
    </h3>
  </div>
  {@render children()}
</section>
