<script lang="ts">
  import type { Locale } from "../lib/routes";

  /**
   * Les deux drapeaux, dessinés plutôt que tapés.
   *
   * Les drapeaux émoji (🇫🇷, 🇬🇧) sont des paires d'indicateurs régionaux, et
   * Windows n'embarque aucun glyphe pour elles : Segoe UI Emoji rend la paire
   * comme les deux lettres « FR ». Le sélecteur paraissait donc cassé là-bas et
   * correct sous Linux. Un SVG ne dépend d'aucune police et se voit pareil des
   * deux côtés.
   *
   * Dessinés sur la grille 16 × 16 de l'icône, le drapeau encastré à ses vraies
   * proportions, pour qu'une taille d'icône ne l'écrase pas en carré.
   *
   * Les couleurs sont celles des drapeaux et ne doivent pas suivre le thème :
   * ce sont des propriétés personnalisées déclarées une fois dans app.css, pas
   * des utilitaires. Le filet, lui, est en `currentColor`, parce que lui doit
   * survivre au mode sombre.
   */
  let { locale, class: extra = "" }: { locale: Locale; class?: string } =
    $props();
</script>

{#if locale === "fr"}
  <svg viewBox="0 0 16 16" class="shrink-0 text-foreground/25 {extra}" aria-hidden="true">
    <rect y="2" width="5.34" height="12" fill="var(--flag-fr-blue)" />
    <rect x="5.34" y="2" width="5.32" height="12" fill="var(--flag-white)" />
    <rect x="10.66" y="2" width="5.34" height="12" fill="var(--flag-fr-red)" />
    <rect
      x="0.25"
      y="2.25"
      width="15.5"
      height="11.5"
      fill="none"
      stroke="currentColor"
      stroke-width="0.5"
    />
  </svg>
{:else}
  <svg viewBox="0 0 16 16" class="shrink-0 text-foreground/25 {extra}" aria-hidden="true">
    <!-- viewBox imbriqué : le drapeau se dessine sur sa propre grille 26 × 13,
         une unité par bande, et se met à l'échelle dans l'icône.
         Les cinquante étoiles ne sont pas dessinées : à seize pixels de large
         elles deviennent une bouillie grise qui salit le canton au lieu de le
         décrire. Neuf points suffisent à le dire. -->
    <svg x="0" y="2" width="16" height="12" viewBox="0 0 26 13">
      <rect width="26" height="13" fill="var(--flag-white)" />
      {#each [0, 2, 4, 6, 8, 10, 12] as y (y)}
        <rect {y} width="26" height="1" fill="var(--flag-us-red)" />
      {/each}
      <rect width="10.4" height="7" fill="var(--flag-us-blue)" />
      {#each [1.3, 3.9, 6.5, 9.1] as cx (cx)}
        {#each [1.2, 3.5, 5.8] as cy (cy)}
          <circle {cx} {cy} r="0.42" fill="var(--flag-white)" />
        {/each}
      {/each}
    </svg>
    <rect
      x="0.25"
      y="2.25"
      width="15.5"
      height="11.5"
      fill="none"
      stroke="currentColor"
      stroke-width="0.5"
    />
  </svg>
{/if}
