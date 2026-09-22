<script lang="ts">
  import Layers from "@lucide/svelte/icons/layers";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import MessagesSquare from "@lucide/svelte/icons/messages-square";
  import Server from "@lucide/svelte/icons/server";
  import Section from "../Section.svelte";
  import { i18n } from "../../lib/i18n.svelte";

  const ICONES = [Layers, RefreshCw, MessagesSquare, Server];
</script>

<Section
  id="detector"
  eyebrow={i18n.t.detector.eyebrow}
  title={i18n.t.detector.title}
  description={i18n.t.detector.description}
>
  <div class="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
    {#each i18n.t.detector.items as item, i (item.title)}
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
