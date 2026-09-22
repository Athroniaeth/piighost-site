<script lang="ts">
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Lien from "./Lien.svelte";
  import { i18n } from "../lib/i18n.svelte";
  import type { Project } from "../lib/site";
  import type { NomDePage } from "../lib/routes";

  let { project }: { project: Project } = $props();

  const tagline = $derived(
    i18n.t.projects[project.slug as keyof typeof i18n.t.projects]?.tagline ??
      project.tagline,
  );
</script>

<Lien vers={project.slug as NomDePage} class="group block h-full">
  <div
    class="flex h-full flex-col gap-3 rounded-xl border bg-card p-6 text-card-foreground
           transition-colors group-hover:border-primary"
  >
    <h3 class="font-mono text-lg font-semibold">{project.name}</h3>
    <p class="flex-1 text-sm text-muted-foreground">{tagline}</p>
    <span class="inline-flex items-center text-sm font-medium text-primary">
      Learn more
      <ArrowRight
        class="ml-1 size-4 transition-transform group-hover:translate-x-1"
      />
    </span>
  </div>
</Lien>
