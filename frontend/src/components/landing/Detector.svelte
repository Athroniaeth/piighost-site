<script lang="ts">
  import Layers from "@lucide/svelte/icons/layers";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import MessagesSquare from "@lucide/svelte/icons/messages-square";
  import Server from "@lucide/svelte/icons/server";
  import Section from "../Section.svelte";
  import { i18n } from "../../lib/i18n.svelte";
  import { classeDe } from "../../lib/entites";
  import Regex from "@lucide/svelte/icons/regex";
  import gliner2 from "../../assets/marques/gliner2.png";
  import spacy from "../../assets/marques/spacy.png";
  import huggingface from "../../assets/marques/huggingface.svg";
  import presidio from "../../assets/marques/presidio.png";

  const ICONES = [Layers, RefreshCw, MessagesSquare, Server];

  /**
   * Les détecteurs, comme les frameworks du bandeau : une marque et un nom.
   *
   * Chaque logo est celui que le projet sert lui-même. GLiNER2 prend l'étoile
   * de Fastino, qui le publie, inversée en mode sombre puisqu'elle est noire.
   * Transformers prend le visage de Hugging Face, et Presidio le carré de
   * Microsoft, qui est l'icône de son propre dépôt. Regex n'est pas une
   * marque mais une technique : un glyphe neutre, à la couleur du texte.
   */
  const DETECTEURS = [
    { nom: "Regex", glyphe: Regex },
    { nom: "GLiNER2", src: gliner2, inverse: true },
    { nom: "spaCy", src: spacy },
    { nom: "Transformers", src: huggingface },
    { nom: "Presidio", src: presidio },
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
  <div class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
    <p class="text-sm text-muted-foreground">{i18n.t.detector.supported}</p>
    <ul class="flex flex-wrap items-center justify-center gap-6">
      {#each DETECTEURS as detecteur (detecteur.nom)}
        <li class="flex items-center gap-2">
          {#if detecteur.glyphe}
            {@const Glyphe = detecteur.glyphe}
            <Glyphe class="size-6 shrink-0" aria-hidden="true" />
          {:else}
            <img
              src={detecteur.src}
              alt=""
              aria-hidden="true"
              class={[
                "size-6 shrink-0 object-contain",
                detecteur.inverse && "dark:invert",
              ]}
            />
          {/if}
          {detecteur.nom}
        </li>
      {/each}
    </ul>
  </div>
</Section>
