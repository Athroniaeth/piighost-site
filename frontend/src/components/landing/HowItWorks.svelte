<script lang="ts">
  import Section from "../Section.svelte";
  import Ghost from "../Ghost.svelte";
  import { classeDe } from "../../lib/entites";
  import { i18n } from "../../lib/i18n.svelte";

  /**
   * Un diagramme de séquence en quatre couloirs : l'utilisateur, piighost, le
   * modèle et les outils.
   *
   * Tout est visible d'un coup, sans onglet ni défilement : l'argument est
   * que la colonne du modèle ne contient que des jetons, et il ne se voit que
   * si toute la conversation est sous les yeux. Le retour de l'outil y figure
   * exprès : c'est le passage où une fuite se glisse le plus facilement, et
   * piighost le réanonymise avant que le modèle ne le lise.
   *
   * La CSP refuse les attributs `style`, donc les positions sont des classes
   * écrites en toutes lettres, une par couloir et par intervalle.
   */
  type Couloir = 0 | 1 | 2 | 3;
  type Gabarit = "send" | "sent" | "reply" | "code";

  const VALEURS = {
    ID: { brut: "#ACME-9123", jeton: "<<ID:1>>" },
    EMAIL: { brut: "marie.lambert@acme.com", jeton: "<<EMAIL:1>>" },
  } as const;

  const MESSAGES: Array<{
    de: Couloir;
    a: Couloir;
    gabarit: Gabarit;
    jetons: boolean;
  }> = [
    { de: 0, a: 1, gabarit: "send", jetons: false },
    { de: 1, a: 2, gabarit: "send", jetons: true },
    { de: 2, a: 1, gabarit: "code", jetons: true },
    { de: 1, a: 3, gabarit: "code", jetons: false },
    { de: 3, a: 1, gabarit: "sent", jetons: false },
    { de: 1, a: 2, gabarit: "sent", jetons: true },
    { de: 2, a: 1, gabarit: "reply", jetons: true },
    { de: 1, a: 0, gabarit: "reply", jetons: false },
  ];

  const LIGNES = [
    "left-[12.5%]",
    "left-[37.5%]",
    "left-[62.5%]",
    "left-[87.5%]",
  ];

  /** La flèche et sa bulle, pour chaque intervalle parcouru. */
  const INTERVALLES: Record<string, { fleche: string; bulle: string }> = {
    "0-1": { fleche: "left-[12.5%] w-[25%]", bulle: "left-[25%]" },
    "1-2": { fleche: "left-[37.5%] w-[25%]", bulle: "left-[50%]" },
    "1-3": { fleche: "left-[37.5%] w-[50%]", bulle: "left-[62.5%]" },
  };
  const intervalle = (de: Couloir, a: Couloir) =>
    INTERVALLES[`${Math.min(de, a)}-${Math.max(de, a)}`];

  const hw = $derived(i18n.t.howItWorks);
  const couloirs = $derived([
    hw.lanes.user,
    "piighost",
    hw.lanes.model,
    hw.lanes.tools,
  ]);

  /** Un gabarit rempli, en valeurs ou en jetons, découpé en morceaux. */
  function morceaux(gabarit: Gabarit, jetons: boolean) {
    const texte =
      gabarit === "code" ? "send_email(to={EMAIL})" : hw.messages[gabarit];
    return texte.split(/(\{ID\}|\{EMAIL\})/g).map((part) => {
      const cle = part.slice(1, -1) as keyof typeof VALEURS;
      if (!(part.startsWith("{") && cle in VALEURS))
        return { texte: part, classe: "" };
      const v = VALEURS[cle];
      return {
        texte: jetons ? v.jeton : v.brut,
        classe: `rounded px-1 font-mono text-[0.85em] ${classeDe(v.jeton)}`,
      };
    });
  }
</script>

{#snippet bulle(gabarit: Gabarit, jetons: boolean)}
  <span class={gabarit === "code" ? "font-mono text-[0.75rem]" : ""}
    >{#each morceaux(gabarit, jetons) as m, i (i)}{#if m.classe}<span
          class={m.classe}>{m.texte}</span
        >{:else}{m.texte}{/if}{/each}</span
  >
{/snippet}

<Section id="how-it-works" eyebrow={hw.eyebrow} title={hw.title}>
  <div class="mx-auto max-w-5xl">
    <!-- Le diagramme, à partir de 768 px. Il est décoratif pour un lecteur
         d'écran, qui lit la liste ci-dessous, la même conversation. -->
    <div class="hidden md:block" aria-hidden="true">
      <div class="grid grid-cols-4 text-center">
        {#each couloirs as nom, i (i)}
          <p
            class={[
              "flex items-center justify-center gap-1.5 text-[0.8125rem] font-semibold tracking-wide",
              i === 1 ? "text-primary" : "text-muted-foreground uppercase",
            ]}
          >
            {#if i === 1}<Ghost class="size-4" />{/if}{nom}
          </p>
        {/each}
      </div>
      <div class="relative mt-3">
        <div
          class="absolute -inset-y-1 left-[52%] w-[21%] rounded-xl bg-primary/5"
        ></div>
        {#each LIGNES as ligne, i (i)}
          <div
            class={[
              "absolute inset-y-0",
              ligne,
              i === 1 ? "w-0.5 bg-primary/50" : "w-px bg-border",
            ]}
          ></div>
        {/each}
        {#each MESSAGES as message, i (i)}
          {@const iv = intervalle(message.de, message.a)}
          <div class="relative h-[4.4rem]">
            <div
              class={[
                "absolute top-[2.95rem] border-t-[1.5px] border-muted-foreground after:absolute after:-top-[5px] after:border-y-[4.5px] after:border-y-transparent after:content-['']",
                iv.fleche,
                message.a > message.de
                  ? "after:-right-px after:border-l-[7px] after:border-l-muted-foreground"
                  : "after:-left-px after:border-r-[7px] after:border-r-muted-foreground",
              ]}
            ></div>
            <div
              class={[
                "absolute top-[0.9rem] -translate-x-1/2 whitespace-nowrap rounded-md border bg-card px-2.5 py-1 text-[0.8125rem] leading-snug",
                iv.bulle,
              ]}
            >
              {@render bulle(message.gabarit, message.jetons)}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- En dessous de 768 px, et pour les lecteurs d'écran : la liste. -->
    <ol class="grid gap-3 md:sr-only">
      {#each MESSAGES as message, i (i)}
        <li class="rounded-lg border bg-card px-4 py-3">
          <p
            class="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {couloirs[message.de]} → {couloirs[message.a]}
          </p>
          <p class="mt-1 break-words text-[0.9375rem] leading-relaxed">
            {@render bulle(message.gabarit, message.jetons)}
          </p>
        </li>
      {/each}
    </ol>

    <p class="mt-6 text-center text-sm text-muted-foreground">{hw.note}</p>
  </div>
</Section>
