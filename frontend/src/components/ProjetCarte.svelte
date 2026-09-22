<script lang="ts">
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Lien from "./Lien.svelte";
  import { tProjet } from "../lib/i18n.svelte";

  let { slug }: { slug: "piighost" | "api" | "chat" | "proofreader" } = $props();
</script>

<Lien
  vers={slug}
  class="group flex flex-col rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-colors
         hover:ring-foreground/25 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
>
  <span class="flex items-center gap-1.5 font-mono text-sm font-medium">
    {tProjet(slug, "title")}
    <ArrowRight class="size-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
  </span>
  <span class="mt-2 text-[0.85rem] leading-relaxed text-muted-foreground">
    {tProjet(slug, "lede")}
  </span>
</Lien>
