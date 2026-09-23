<script lang="ts">
  /**
   * Un tilde, pour « en partie » : le degré entre la coche et la croix.
   *
   * lucide n'en a pas de seul, seulement `equal-approximately`, qui en porte
   * deux et se lit « à peu près égal ». C'est l'une de ses deux vagues, recentrée,
   * au même trait que les autres icônes du site pour qu'elles se tiennent.
   */
  let { class: extra = "" }: { class?: string } = $props();
</script>

<svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={extra}
  aria-hidden="true"
  focusable="false"><path d="M5 12a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0" /></svg
>
