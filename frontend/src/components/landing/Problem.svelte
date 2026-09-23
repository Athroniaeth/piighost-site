<script lang="ts">
  import Check from "@lucide/svelte/icons/check";
  import X from "@lucide/svelte/icons/x";
  import Cloud from "@lucide/svelte/icons/cloud";
  import Cpu from "@lucide/svelte/icons/cpu";
  import Ban from "@lucide/svelte/icons/ban";
  import Tilde from "../Tilde.svelte";
  import Section from "../Section.svelte";
  import Ghost from "../Ghost.svelte";
  import { i18n } from "../../lib/i18n.svelte";
  import { cn } from "../../lib/cn";

  /**
   * Le problème posé comme ce qu'il est : un dilemme.
   *
   * Le titre dit « vous ne devriez pas avoir à choisir ». Trois options, chacune
   * avec ce qu'elle coûte, puis celle qui ne force pas le choix, en dernière
   * ligne. La section mène donc au produit, là où la version en cartes
   * s'arrêtait sur « interdire ». Celle-ci est gardée à part, dans
   * ProblemeCartes.svelte.
   *
   * Les verdicts sont écrits ici et non dans le dictionnaire : ils ne dépendent
   * pas de la langue, et les écrire deux fois les ferait dériver.
   *
   * Trois états, pas deux. « En partie » dit un inconvénient mineur et réel :
   * une bibliothèque qui tourne sur CPU a un coût, et le cacher sous une coche
   * serait mentir. Il porte `--warning`, ajouté à la charte pour ça.
   *
   * Sous 768 px, le tableau devient une pile de cartes, une par méthode : ses
   * cinq colonnes ne tiennent pas dans un téléphone, et un tableau qu'on fait
   * défiler de côté se lit une colonne à la fois, en perdant l'en-tête.
   */
  type Verdict = "oui" | "partiel" | "non";
  const VERDICTS: Verdict[][] = [
    ["oui", "non", "oui", "oui"], // modèle hébergé
    ["non", "oui", "non", "partiel"], // modèle local
    ["non", "oui", "oui", "non"], // interdire
    ["oui", "oui", "partiel", "oui"], // piighost
  ];

  /** L'icône de chaque méthode. Neutre pour les deux options qui marchent en
   *  partie, rouge pour celle qui renonce, primaire pour celle qui répond. */
  const METHODES = [
    { icone: Cloud, ton: "text-muted-foreground" },
    { icone: Cpu, ton: "text-muted-foreground" },
    { icone: Ban, ton: "text-destructive" },
  ];

  const table = $derived(i18n.t.problem.table);
  const DERNIERE = VERDICTS.length - 1;
</script>

{#snippet verdict(v: Verdict)}
  {#if v === "oui"}
    <Check class="size-4 shrink-0 text-primary" aria-hidden="true" />
    <span class="sr-only">{table.yes},</span>
  {:else if v === "partiel"}
    <Tilde class="size-4 shrink-0 text-warning" />
    <span class="sr-only">{table.partly},</span>
  {:else}
    <X class="size-4 shrink-0 text-destructive" aria-hidden="true" />
    <span class="sr-only">{table.no},</span>
  {/if}
{/snippet}

{#snippet methode(r: number)}
  {#if r === DERNIERE}
    <Ghost size={20} class="shrink-0" />
  {:else}
    {@const M = METHODES[r]}
    <M.icone class={cn("size-5 shrink-0", M.ton)} aria-hidden="true" />
  {/if}
{/snippet}

<Section
  id="problem"
  eyebrow={i18n.t.problem.eyebrow}
  title={i18n.t.problem.title}
>
  <div class="mx-auto max-w-5xl">
    <!-- `relative` retient les libellés sr-only, positionnés en absolu : sans
         lui, ils échappaient au cadre qui défile et élargissaient la page. -->
    <div
      class="relative hidden overflow-x-auto rounded-xl border bg-card p-2 md:block"
    >
      <table
        class="w-full min-w-[48rem] border-separate border-spacing-0 text-left text-[0.9375rem]"
      >
        <thead>
          <tr>
            <th scope="col" class="w-[22%] border-b px-5 py-4"
              ><span class="sr-only">{table.option}</span></th
            >
            {#each table.columns as colonne (colonne)}
              <th
                scope="col"
                class="border-b px-5 py-4 text-[0.8125rem] font-semibold tracking-wide text-muted-foreground uppercase"
              >
                {colonne}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each table.rows as ligne, r (ligne.label)}
            {@const nous = r === DERNIERE}
            <tr class={cn(nous && "bg-primary/7")}>
              <th
                scope="row"
                class={cn(
                  "px-5 py-4 font-semibold",
                  nous ? "rounded-l-lg text-primary" : "border-b",
                )}
              >
                <span class="inline-flex items-center gap-2">
                  {@render methode(r)}
                  {ligne.label}
                </span>
              </th>
              {#each ligne.cells as cellule, c (c)}
                <td
                  class={cn(
                    "px-5 py-4",
                    nous ? "last:rounded-r-lg" : "border-b",
                  )}
                >
                  <span class="inline-flex items-center gap-2">
                    {@render verdict(VERDICTS[r][c])}
                    {cellule}
                  </span>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <ul class="grid gap-3 md:hidden">
      {#each table.rows as ligne, r (ligne.label)}
        {@const nous = r === DERNIERE}
        <li
          class={cn(
            "rounded-xl border p-4",
            nous ? "border-primary/40 bg-primary/7" : "bg-card",
          )}
        >
          <p
            class={cn(
              "flex items-center gap-2 font-semibold",
              nous && "text-primary",
            )}
          >
            {@render methode(r)}
            {ligne.label}
          </p>
          <dl class="mt-3 grid gap-2 text-[0.9375rem]">
            {#each ligne.cells as cellule, c (c)}
              <div class="flex items-baseline justify-between gap-4">
                <dt class="text-sm text-muted-foreground">
                  {table.columns[c]}
                </dt>
                <dd class="inline-flex items-center gap-2 text-right">
                  {@render verdict(VERDICTS[r][c])}
                  {cellule}
                </dd>
              </div>
            {/each}
          </dl>
        </li>
      {/each}
    </ul>
    <p class="mt-5 max-w-[90ch] text-sm text-muted-foreground">
      <strong class="font-semibold text-foreground">{table.noteLead}</strong>
      {table.note}
    </p>
  </div>
</Section>
