<script lang="ts">
  import Section from "../Section.svelte";
  import ProjectCard from "../ProjectCard.svelte";
  import { i18n } from "../../lib/i18n.svelte";
  import { projects } from "../../lib/site";

  /** Neuf emplacements : les quatre projets, puis des cases en attente. La
   *  grille reste pleine, et les vides disent qu'il en viendra d'autres. */
  const EMPLACEMENTS = 9;
  const EMPREINTES = ["2b1f4a", "7c43e9", "9af0d2", "1e8c75", "f30b86"];

  const attente = Array.from(
    { length: Math.max(0, EMPLACEMENTS - projects.length) },
    (_, i) => EMPREINTES[i % EMPREINTES.length],
  );
</script>

<Section
  id="ecosystem"
  eyebrow={i18n.t.ecosystem.eyebrow}
  title={i18n.t.ecosystem.title}
  description={i18n.t.ecosystem.description}
>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {#each projects as project (project.slug)}
      <ProjectCard {project} />
    {/each}
    {#each attente as empreinte, i (i)}
      <div
        class="hidden h-full rounded-xl border border-dashed bg-transparent p-6 opacity-60 sm:block"
      >
        <!-- Une case vide à la place du pictogramme : les titres restent
             alignés avec ceux des vrais projets sur la même rangée. -->
        <div class="flex items-center gap-3">
          <span class="size-9 shrink-0 rounded-md border border-dashed"></span>
          <h3 class="font-mono text-lg font-semibold text-muted-foreground">
            {`<<PROJECT_NAME:${empreinte}>>`}
          </h3>
        </div>
        <p class="mt-4 text-sm text-muted-foreground">
          {i18n.t.ecosystem.moreToCome}
        </p>
      </div>
    {/each}
  </div>
</Section>
