<script lang="ts">
  import { classeDe } from "../lib/entites";
  import { estTexte, type Entite, type Segment } from "../lib/flux.svelte";
  import { cn } from "../lib/cn";

  /**
   * Une phrase dont les valeurs sensibles basculent en jetons.
   *
   * La teinte dit la catégorie, l'intensité dit l'état : pâle tant que la
   * valeur est en clair, renforcé une fois remplacée par son jeton. Le
   * battement se pose en `--foreground`, pas en couleur d'accent : c'est une
   * marque d'attention passagère, pas une catégorie de plus.
   */
  let {
    entites,
    segments,
    remplacees,
    battement = null,
  }: {
    entites: Entite[];
    segments: Segment[];
    remplacees: number;
    battement?: number | null;
  } = $props();

  type Morceau = { texte: string } | { index: number; suffixe: string };

  const PONCTUATION = /^[.,;:!?)\]]+/;

  /**
   * Recoupe la phrase pour que la ponctuation qui suit une valeur lui reste
   * collée.
   *
   * Une pastille est une boîte en ligne atomique : le navigateur a le droit de
   * couper juste après, même sans espace. Quand la ligne est pleine, le point
   * final part donc seul sur la ligne suivante. On le déplace dans la pastille,
   * à l'intérieur d'un conteneur insécable.
   */
  const morceaux = $derived.by(() => {
    const sortie: Morceau[] = [];
    segments.forEach((segment, i) => {
      if (estTexte(segment)) {
        const precedeParUneValeur = i > 0 && !estTexte(segments[i - 1]);
        sortie.push({
          texte: precedeParUneValeur
            ? segment.texte.replace(PONCTUATION, "")
            : segment.texte,
        });
        return;
      }
      const suivant = segments[i + 1];
      const suffixe =
        suivant && estTexte(suivant)
          ? (PONCTUATION.exec(suivant.texte)?.[0] ?? "")
          : "";
      sortie.push({ index: segment.entite, suffixe });
    });
    return sortie;
  });
</script>

{#each morceaux as morceau, i (i)}
  {#if "texte" in morceau}<span>{morceau.texte}</span>{:else}
    {@const entite = entites[morceau.index]}
    {@const masquee = morceau.index < remplacees}
    <span class="whitespace-nowrap"
      ><span
        class={cn(
          "inline-block rounded px-1 transition-all duration-500 ease-in-out",
          classeDe(entite.jeton, masquee ? "jeton" : "valeur"),
          battement === morceau.index
            ? "scale-[1.04] ring-1 ring-foreground/30"
            : "scale-100",
        )}>{masquee ? entite.jeton : entite.brut}</span
      >{morceau.suffixe}</span
    >{/if}
{/each}
