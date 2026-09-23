<!--
  La section « le problème » dans sa version d'origine, quatre cartes égales.

  Gardée à part, à la demande, quand la version en tableau l'a remplacée le
  23 septembre 2026. Elle n'est rendue nulle part. Pour la remettre en place,
  une ligne dans pages/Home.svelte : importer ProblemeCartes à la place de
  Problem. Sa copie vit toujours dans `problem.items`, dans les deux
  dictionnaires. Le tag git `base-probleme` fige l'état exact où elle servait.
-->
<script lang="ts">
  import Cloud from "@lucide/svelte/icons/cloud";
  import Cpu from "@lucide/svelte/icons/cpu";
  import Scale from "@lucide/svelte/icons/scale";
  import Ban from "@lucide/svelte/icons/ban";
  import Section from "../Section.svelte";
  import { i18n } from "../../lib/i18n.svelte";

  const ICONES = [Cloud, Cpu, Scale, Ban];
</script>

<Section
  id="problem"
  eyebrow={i18n.t.problem.eyebrow}
  title={i18n.t.problem.title}
>
  <div class="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
    {#each i18n.t.problem.items as item, i (item.title)}
      {@const Icone = ICONES[i]}
      <div class="rounded-xl border bg-card p-6 text-card-foreground">
        <div class="flex items-center gap-3">
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
          >
            <Icone class="size-5" />
          </span>
          <h3 class="text-lg font-semibold">{item.title}</h3>
        </div>
        <p class="mt-4 text-justify text-sm hyphens-auto text-muted-foreground">
          {item.body}
        </p>
      </div>
    {/each}
  </div>
</Section>
