<script lang="ts">
  import BookOpen from "@lucide/svelte/icons/book-open";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import Package from "@lucide/svelte/icons/package";
  import GithubIcon from "./GithubIcon.svelte";
  import Button from "../ui/Button.svelte";
  import { i18n } from "../lib/i18n.svelte";
  import { track } from "../lib/analytics";
  import type { Project } from "../lib/site";

  let { project }: { project: Project } = $props();

  const tagline = $derived(
    i18n.t.projects[project.slug as keyof typeof i18n.t.projects]?.tagline ??
      project.tagline,
  );

  const sortant = (destination: string) =>
    track({ name: "outbound", props: { destination, page: project.slug } });
</script>

<div class="border-b">
  <div class="feuille mx-auto max-w-3xl px-4 py-16">
    <h1 class="font-mono text-3xl font-bold sm:text-4xl">{project.name}</h1>
    <p class="mt-4 sm:text-justify text-lg hyphens-auto text-muted-foreground">
      {tagline}
    </p>
    <div class="mt-6 flex flex-wrap gap-3">
      <Button
        variant="outline"
        size="sm"
        class="max-sm:h-10 max-sm:px-3.5"
        href={project.repo}
        target="_blank"
        rel="noreferrer"
        onclick={() => sortant("repo")}
      >
        <GithubIcon class="mr-1 size-4" />
        {i18n.t.projectHeader.repository}
      </Button>
      {#if project.app}
        <Button
          size="sm"
          class="max-sm:h-10 max-sm:px-3.5"
          href={project.app}
          target="_blank"
          rel="noreferrer"
          onclick={() => sortant("app")}
        >
          <ExternalLink class="mr-1 size-4" />
          {i18n.t.projectHeader.app}
        </Button>
      {/if}
      {#if project.docs}
        <Button
          variant="outline"
          size="sm"
          class="max-sm:h-10 max-sm:px-3.5"
          href={project.docs}
          target="_blank"
          rel="noreferrer"
          onclick={() => sortant("docs")}
        >
          <BookOpen class="mr-1 size-4" />
          {i18n.t.projectHeader.docs}
        </Button>
      {/if}
      {#if project.pypi}
        <Button
          variant="outline"
          size="sm"
          class="max-sm:h-10 max-sm:px-3.5"
          href={project.pypi}
          target="_blank"
          rel="noreferrer"
          onclick={() => sortant("pypi")}
        >
          <Package class="mr-1 size-4" />
          {i18n.t.projectHeader.pypi}
        </Button>
      {/if}
    </div>
  </div>
</div>
