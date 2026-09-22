<script lang="ts">
  import Ghost from "./Ghost.svelte";

  /**
   * Le verrouillage horizontal, en currentColor.
   *
   * Pas de corail ici : cette page affiche des valeurs détectées, donc elle
   * tombe sous la règle de la charte, la seule couleur qui ne soit pas de la
   * donnée est celle des actions. Le corail vit sur la vignette de partage et
   * les icônes, où aucune donnée n'est à l'écran.
   */
  let { size = 20 }: { size?: number } = $props();
</script>

<span class="inline-flex items-center gap-2 font-semibold tracking-[-0.03em]">
  <Ghost {size} />
  <span style:font-size="{size * 0.92}px">piighost</span>
</span>
