<script lang="ts">
  import Layers from "@lucide/svelte/icons/layers";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import MessagesSquare from "@lucide/svelte/icons/messages-square";
  import Server from "@lucide/svelte/icons/server";
  import Section from "../Section.svelte";
  import { i18n } from "../../lib/i18n.svelte";
  import { classeDe } from "../../lib/entites";

  const ICONES = [Layers, RefreshCw, MessagesSquare, Server];

  /** Des noms propres : ils ne se traduisent pas. */
  const DETECTEURS = [
    "regex",
    "GLiNER2",
    "spaCy",
    "Transformers",
    "LLM",
    "Presidio",
  ];

  /** Un jeton cité dans le texte porte la teinte de sa catégorie. */
  const morceaux = (texte: string) =>
    texte.split(/(<<[^>]+>>)/g).map((part) => ({
      texte: part,
      classe: part.startsWith("<<")
        ? `whitespace-nowrap rounded px-1 font-mono text-[0.85em] ${classeDe(part)}`
        : "",
    }));
</script>

<!--
  Une rangée de quatre, sans cartes : des filets séparent les colonnes. Sur
  deux colonnes, les filets suivent la grille, d'où les règles par rang.
-->
<Section
  id="detector"
  eyebrow={i18n.t.detector.eyebrow}
  title={i18n.t.detector.title}
  description={i18n.t.detector.description}
  centerDescription
>
  <div class="grid border-y sm:grid-cols-2 lg:grid-cols-4">
    {#each i18n.t.detector.items as item, i (item.title)}
      {@const Icone = ICONES[i]}
      <div
        class="border-t px-7 py-8 first:border-t-0 sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(even)]:border-l lg:border-t-0 lg:border-l lg:first:border-l-0"
      >
        <span
          class="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary"
        >
          <Icone class="size-5" />
        </span>
        <h3 class="mt-4 text-[1.0625rem] font-semibold">{item.title}</h3>
        <p class="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
          {#each morceaux(item.body) as morceau, j (j)}{#if morceau.classe}<span
                class={morceau.classe}>{morceau.texte}</span
              >{:else}{morceau.texte}{/if}{/each}
        </p>
      </div>
    {/each}
  </div>
  <div
    class="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-[0.9375rem] text-muted-foreground"
  >
    <span>{i18n.t.detector.supported}</span>
    <ul class="flex flex-wrap justify-center gap-2">
      {#each DETECTEURS as nom (nom)}
        <li
          class="rounded-md border bg-background px-2 py-0.5 font-mono text-[0.8125rem] text-foreground"
        >
          {nom}
        </li>
      {/each}
    </ul>
  </div>
</Section>
