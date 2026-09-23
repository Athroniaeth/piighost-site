<script lang="ts">
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Package from "@lucide/svelte/icons/package";
  import Server from "@lucide/svelte/icons/server";
  import MessagesSquare from "@lucide/svelte/icons/messages-square";
  import FileText from "@lucide/svelte/icons/file-text";
  import Lien from "./Lien.svelte";
  import { i18n } from "../lib/i18n.svelte";
  import type { Project } from "../lib/site";
  import type { NomDePage } from "../lib/routes";

  let { project }: { project: Project } = $props();

  /** Le rôle du projet, en pictogramme : la bibliothèque est un paquet, le
   *  serveur un serveur, et les deux démonstrations montrent leur objet. */
  const ICONES = {
    piighost: Package,
    api: Server,
    chat: MessagesSquare,
    proofreader: FileText,
  } as const;
  const Icone = $derived(ICONES[project.slug as keyof typeof ICONES] ?? Package);

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
    <div class="flex items-center gap-3">
      <span
        class="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
      >
        <Icone class="size-5" />
      </span>
      <h3 class="font-mono text-lg font-semibold">{project.name}</h3>
    </div>
    <p class="flex-1 text-sm text-muted-foreground">{tagline}</p>
    <span class="inline-flex items-center text-sm font-medium text-primary">
      {i18n.t.ecosystem.learnMore}
      <ArrowRight
        class="ml-1 size-4 transition-transform group-hover:translate-x-1"
      />
    </span>
  </div>
</Lien>
