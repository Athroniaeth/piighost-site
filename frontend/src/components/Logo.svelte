<script lang="ts">
  import Ghost from "./Ghost.svelte";

  /**
   * Le verrouillage de piighost : le fantôme v3 et le mot, en minuscules. Il
   * grandit dans la barre de navigation (size 30) et reste plus petit ailleurs.
   *
   * Le symbole est dimensionné en rem, comme le mot, et non par les attributs
   * width et height en px : au-delà de 1920 px la racine passe à 18 puis 21 px,
   * le mot suivait et le symbole restait à 30 px. Le hub, lui, suivait déjà.
   */
  let { size = 20 }: { size?: number } = $props();
</script>

<span class="inline-flex items-center gap-2">
  <Ghost
    {size}
    class={size >= 28
      ? "size-[1.875rem] text-foreground"
      : "size-[1.375rem] text-foreground"}
  />
  <span
    class={[
      size >= 28 ? "text-[1.6rem]" : "text-[1.3rem]",
      "font-bold tracking-[-0.035em]",
    ]}>piighost</span
  >
</span>
