<script lang="ts">
  import Segments from "./Segments.svelte";
  import {
    Flux,
    ent,
    txt,
    type Entite,
    type Segment,
  } from "../lib/flux.svelte";

  /**
   * La démonstration du bandeau d'accueil : une phrase ordinaire dont chaque
   * valeur sensible part et revient. C'est le seul endroit du site où le
   * mécanisme se voit avant d'être lu.
   */
  const ENTITES: Entite[] = [
    { brut: "Patrick Dupont", jeton: "<<PERSON:1>>" },
    { brut: "Acme Corp", jeton: "<<ORG:1>>" },
    { brut: "#ACME-9123", jeton: "<<ID:1>>" },
    { brut: "12 rue de la Paix", jeton: "<<ADDRESS:1>>" },
    { brut: "Paris", jeton: "<<LOCATION:1>>" },
    { brut: "patrick.dupont@acme.com", jeton: "<<EMAIL:1>>" },
    { brut: "+33 6 12 34 56 78", jeton: "<<PHONE:1>>" },
  ];

  const SEGMENTS: Segment[] = [
    txt("Hi, this is "),
    ent(0),
    txt(" from "),
    ent(1),
    txt(". My order "),
    ent(2),
    txt(" should be delivered to "),
    ent(3),
    txt(", "),
    ent(4),
    txt(". You can reach me by email at "),
    ent(5),
    txt(" or by phone at "),
    ent(6),
    txt("."),
  ];

  const flux = new Flux(ENTITES.length);
  $effect(() => flux.demarrer());
</script>

<div
  class="mx-auto w-full max-w-md rounded-xl border bg-card p-6 shadow-sm sm:p-8 lg:max-w-none"
>
  <p class="font-mono text-base leading-relaxed sm:text-lg">
    <Segments
      entites={ENTITES}
      segments={SEGMENTS}
      remplacees={flux.remplacees}
      battement={flux.battement}
    />
  </p>
</div>
