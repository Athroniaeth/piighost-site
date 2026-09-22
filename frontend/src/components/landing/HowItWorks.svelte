<script lang="ts">
  import Section from "../Section.svelte";
  import Echange from "../Echange.svelte";
  import Segments from "../Segments.svelte";
  import Tabs from "../../ui/Tabs.svelte";
  import { classeDe } from "../../lib/entites";
  import { ent, txt, type Entite, type Segment } from "../../lib/flux.svelte";
  import { i18n } from "../../lib/i18n.svelte";

  /**
   * Les quatre temps du mécanisme, un par onglet, qui défilent tout seuls tant
   * que la section est à l'écran.
   *
   * L'observateur d'intersection est ce qui évite qu'une section invisible
   * tourne dans le vide, et l'arrêt sur préférence de mouvement réduit est la
   * même garantie que dans les boîtes elles-mêmes.
   */
  const ORDRE = ["detect", "anonymize", "tools", "deanonymize"] as const;
  // Doit rester égal à la durée de .hiw-progress dans studio.css.
  const DIAPO_MS = 10000;

  const P1: Entite = { brut: "Patrick Dupont", jeton: "<<PERSON:1>>" };
  const P2: Entite = { brut: "Marie Lambert", jeton: "<<PERSON:2>>" };
  const P3: Entite = { brut: "Jean Moreau", jeton: "<<PERSON:3>>" };
  const E1: Entite = { brut: "patrick.dupont@acme.com", jeton: "<<EMAIL:1>>" };
  const E2: Entite = { brut: "marie.lambert@acme.com", jeton: "<<EMAIL:2>>" };
  const ID1: Entite = { brut: "#ACME-9123", jeton: "<<ID:1>>" };

  const ENTITES_ANONYMISE = [P1, P2, P3, E1, E2, ID1];
  const SEGMENTS_ANONYMISE: Segment[] = [
    txt("Hi, this is "),
    ent(0),
    txt(". Could you forward this to "),
    ent(1),
    txt(" and "),
    ent(2),
    txt("? My email is "),
    ent(3),
    txt(", and you can also cc "),
    ent(4),
    txt(". The case ID is "),
    ent(5),
    txt("."),
  ];

  const ENTITES_OUTILS = [E1, ID1, P2, P3];
  const SEGMENTS_OUTILS: Segment[] = [
    txt("send_email(\n  to="),
    ent(0),
    txt(',\n  subject="Case '),
    ent(1),
    txt('",\n  body="Forwarding to '),
    ent(2),
    txt(" and "),
    ent(3),
    txt('",\n)'),
  ];

  const ENTITES_RESTITUE = [P2, P3, ID1, E1, E2];
  const SEGMENTS_RESTITUE: Segment[] = [
    txt("I have forwarded your message to "),
    ent(0),
    txt(" and "),
    ent(1),
    txt(" with the case "),
    ent(2),
    txt(". A confirmation will be sent to "),
    ent(3),
    txt(" and copied to "),
    ent(4),
    txt("."),
  ];

  /** Une légende où les jetons portent la teinte de leur catégorie, comme
   *  dans les boîtes juste au dessus. */
  const morceaux = (texte: string) =>
    texte.split(/(<<[^>]+>>)/g).map((part) => ({
      texte: part,
      classe: part.startsWith("<<")
        ? `rounded px-1 font-mono ${classeDe(part, "jeton")}`
        : "",
    }));

  let actif = $state<string>("detect");
  let cadre = $state<HTMLDivElement | null>(null);
  let visible = $state(false);
  let reduit = $state(false);

  $effect(() => {
    if (!cadre) return;
    const observateur = new IntersectionObserver(
      ([e]) => (visible = e.isIntersecting),
      {
        threshold: 0.5,
      },
    );
    observateur.observe(cadre);
    return () => observateur.disconnect();
  });

  $effect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const maj = () => (reduit = mq.matches);
    maj();
    mq.addEventListener("change", maj);
    return () => mq.removeEventListener("change", maj);
  });

  const defile = $derived(visible && !reduit);

  $effect(() => {
    if (!defile) return;
    const courant = actif;
    const minuteur = setTimeout(() => {
      const i = ORDRE.indexOf(courant as (typeof ORDRE)[number]);
      actif = ORDRE[(i + 1) % ORDRE.length];
    }, DIAPO_MS);
    return () => clearTimeout(minuteur);
  });

  const hw = $derived(i18n.t.howItWorks);
  const onglets = $derived(ORDRE.map((id) => ({ id, label: hw.tabs[id] })));
</script>

{#snippet legende(texte: string)}
  <p class="text-sm text-muted-foreground">
    {#each morceaux(texte) as morceau, i (i)}<span class={morceau.classe}
        >{morceau.texte}</span
      >{/each}
  </p>
{/snippet}

<Section id="how-it-works" eyebrow={hw.eyebrow} title={hw.title}>
  <div bind:this={cadre}>
    <Tabs
      {onglets}
      bind:actif
      class="mx-auto max-w-3xl"
      listClass="grid-cols-2 sm:grid-cols-4"
    >
      {#snippet children(courant)}
        <div class="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
          {#if defile}
            {#key `${courant}-${visible}`}
              <div class="hiw-progress h-full bg-primary"></div>
            {/key}
          {/if}
        </div>

        <div class="relative mt-6 flex min-h-[24rem] flex-col justify-center">
          {#if courant === "detect"}
            <div class="space-y-4">
              <div class="rounded-lg border bg-card p-4 shadow-sm">
                <p
                  class="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {hw.labels.userMessage}
                </p>
                <p
                  class="break-words text-justify font-mono text-sm leading-relaxed"
                >
                  <Segments
                    entites={ENTITES_ANONYMISE}
                    segments={SEGMENTS_ANONYMISE}
                    remplacees={0}
                  />
                </p>
              </div>
              {@render legende(hw.detectCaption)}
            </div>
          {:else if courant === "anonymize"}
            <div class="space-y-4">
              <Echange
                entites={ENTITES_ANONYMISE}
                segments={SEGMENTS_ANONYMISE}
                etiquetteBrute={hw.labels.fromUser}
                etiquetteJeton={hw.labels.llmSees}
              />
              {@render legende(hw.anonymizeCaption)}
            </div>
          {:else if courant === "tools"}
            <div class="space-y-4">
              <Echange
                entites={ENTITES_OUTILS}
                segments={SEGMENTS_OUTILS}
                etiquetteBrute={hw.labels.toolRuns}
                etiquetteJeton={hw.labels.toolCall}
                demarreEnJetons
                justifie={false}
              />
              {@render legende(hw.toolsCaption)}
            </div>
          {:else}
            <div class="space-y-4">
              <Echange
                entites={ENTITES_RESTITUE}
                segments={SEGMENTS_RESTITUE}
                etiquetteBrute={hw.labels.userSees}
                etiquetteJeton={hw.labels.llmResponse}
                demarreEnJetons
              />
              {@render legende(hw.deanonymizeCaption)}
            </div>
          {/if}
        </div>
      {/snippet}
    </Tabs>
  </div>
</Section>
