<script lang="ts">
  import Ghost from "./Ghost.svelte";

  /**
   * Le verrouillage horizontal : le fantôme sur la primaire, le mot sur le
   * texte.
   *
   * Le symbole ne porte pas une couleur de marque à lui, il porte celle des
   * actions. C'est ce qui le garde compatible avec la règle de la charte sur
   * une page qui affiche de la donnée — la seule couleur qui n'en soit pas est
   * `--primary` — tout en lui rendant la présence qu'un symbole en gris n'a
   * pas. Deux couleurs suffisent : une troisième ferait un logo bavard.
   */
  let { size = 20 }: { size?: number } = $props();
</script>

<span class="inline-flex items-center gap-2 font-semibold tracking-[-0.035em]">
  <Ghost {size} class="text-primary" />
  <span class="text-[1.265rem]">piighost</span>
</span>
