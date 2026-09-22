<script lang="ts">
  import { t } from "../lib/i18n.svelte";
  import { entityClass, type ValueState } from "../lib/labels";

  /**
   * La démonstration du mécanisme : ce que vous écrivez, ce que le modèle reçoit.
   *
   * La phrase est traduite en entier et porte des emplacements {0} à {3} :
   * assembler des morceaux marcherait en anglais et casserait en français, où
   * les compléments ne se rangent pas dans le même ordre.
   *
   * Les classes viennent du fichier de tokens, écrites en clair, jamais
   * assemblées : la CSP interdit le style en ligne et le purgeur de Tailwind
   * efface ce qu'il n'a pas vu. La teinte dit la catégorie, l'intensité dit
   * l'état. Voir brand/tokens/README.md.
   */
  const VALEURS = [
    { teinte: 1, clair: "Patrick Dupont", jeton: "<<PERSON:1>>" },
    { teinte: 2, clair: "Acme Corp", jeton: "<<ORG:1>>" },
    { teinte: 8, clair: "#ACME-9123", jeton: "<<ID:1>>" },
    { teinte: 3, clair: "12 rue de la Paix", jeton: "<<ADDRESS:1>>" },
  ] as const;

  /** Découpe la phrase traduite autour de ses emplacements. */
  function morceaux(etat: ValueState) {
    const parts = t("home.demo.sentence").split(/\{(\d)\}/);
    return parts.map((part, i) =>
      i % 2 === 0
        ? { texte: part, valeur: null }
        : {
            texte: etat === "valeur" ? VALEURS[+part].clair : VALEURS[+part].jeton,
            valeur: VALEURS[+part],
          },
    );
  }
</script>

{#snippet phrase(etat: ValueState)}
  <p class="font-mono text-[0.84rem] leading-[1.95]">
    {#each morceaux(etat) as bout, i (i)}
      {#if bout.valeur}<mark class="rounded px-1.5 py-px {entityClass(bout.valeur.teinte, etat)}"
          >{bout.texte}</mark
        >{:else}{bout.texte}{/if}
    {/each}
  </p>
{/snippet}

<div class="rounded-xl border bg-card p-5">
  <p class="mb-2.5 font-mono text-[0.625rem] tracking-[0.12em] text-muted-foreground uppercase">
    {t("home.demo.before")}
  </p>
  {@render phrase("valeur")}

  <hr class="my-4 border-t border-dashed" />

  <p class="mb-2.5 font-mono text-[0.625rem] tracking-[0.12em] text-muted-foreground uppercase">
    {t("home.demo.after")}
  </p>
  {@render phrase("jeton")}
</div>
