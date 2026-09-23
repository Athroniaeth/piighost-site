<script lang="ts">
  import Ghost from "./Ghost.svelte";

  /**
   * Le verrouillage de PIIShade, territoire « piighost.dev v3 ». Le mot est
   * en minuscules ; il grandit dans la barre de navigation (size 30).
   */
  let { size = 20 }: { size?: number } = $props();
</script>

<span class="inline-flex items-center gap-2">
  <Ghost {size} class="text-foreground" />
  <span
    class={[
      size >= 28 ? "text-[1.6rem]" : "text-[1.3rem]",
      "font-bold tracking-[-0.035em]",
    ]}>piighost</span
  >
</span>
