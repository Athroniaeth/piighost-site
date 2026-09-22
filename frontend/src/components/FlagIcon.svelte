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
    <!-- viewBox imbriqué : l'Union Jack se dessine sur sa propre grille 60 × 30
         et se met à l'échelle dans l'icône, plutôt que de réécrire chaque
         coordonnée. -->
    <svg x="0" y="2" width="16" height="12" viewBox="0 0 60 30">
      <rect width="60" height="30" fill="var(--flag-gb-blue)" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="var(--flag-white)" stroke-width="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="var(--flag-gb-red)" stroke-width="3" />
      <path d="M30,0 V30 M0,15 H60" stroke="var(--flag-white)" stroke-width="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="var(--flag-gb-red)" stroke-width="6" />
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
