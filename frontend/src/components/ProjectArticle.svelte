<script lang="ts">
  import type { Snippet } from "svelte";
  import Inline from "./Inline.svelte";
  import { i18n } from "../lib/i18n.svelte";
  import type { ProjectPageDict } from "../i18n/types";

  let {
    slug,
    blocs,
  }: {
    slug: keyof typeof i18n.t.projects;
    /** Les extraits de code de la page, indexés par la clé que porte la
     *  section dans le dictionnaire. */
    blocs: Record<string, Snippet>;
  } = $props();

  const page = $derived(i18n.t.projects[slug] as ProjectPageDict);
</script>

<div class="feuille mx-auto max-w-3xl px-4 py-12">
  {#each page.sections as section, i (i)}
    <section class="mt-10 first:mt-0">
      <h2 class="text-2xl font-semibold tracking-tight">{section.heading}</h2>

      {#each section.paragraphs ?? [] as paragraphe, j (j)}
        <p
          class="mt-4 text-justify leading-7 hyphens-auto text-muted-foreground"
        >
          <Inline texte={paragraphe} />
        </p>
      {/each}

      {#if section.list}
        {#if section.ordered}
          <ol
            class="mt-4 list-decimal space-y-2 pl-6 leading-7 text-muted-foreground"
          >
            {#each section.list as item, j (j)}<li>
                <Inline texte={item} />
              </li>{/each}
          </ol>
        {:else}
          <ul
            class="mt-4 list-disc space-y-2 pl-6 leading-7 text-muted-foreground"
          >
            {#each section.list as item, j (j)}<li>
                <Inline texte={item} />
              </li>{/each}
          </ul>
        {/if}
      {/if}

      {#if section.code && blocs[section.code]}
        <div class="mt-4">{@render blocs[section.code]()}</div>
      {/if}

      {#if section.afterCode}
        <p
          class="mt-4 text-justify leading-7 hyphens-auto text-muted-foreground"
        >
          <Inline texte={section.afterCode} />
        </p>
      {/if}
    </section>
  {/each}
</div>
