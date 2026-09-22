<script lang="ts">
  import { i18n } from "../lib/i18n.svelte";

  const p = $derived(i18n.t.philosophy);
</script>

<article class="mx-auto max-w-3xl px-4 py-16">
  <header class="mb-12 text-center">
    <p class="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
      {p.eyebrow}
    </p>
    <h1 class="text-4xl font-bold tracking-tight sm:text-5xl 2xl:text-4xl">
      {p.title}
    </h1>
  </header>

  {#if p.intro}
    <p
      class="mb-12 text-justify text-lg leading-relaxed hyphens-auto text-muted-foreground 2xl:text-base"
    >
      {p.intro}
    </p>
  {/if}

  {#each p.sections as section, si (section.id ?? si)}
    <section id={section.id}>
      <h2 class="mt-12 text-2xl font-semibold tracking-tight 2xl:text-xl">
        {section.heading}
      </h2>

      {#each section.paragraphs as para, pi (pi)}
        <p
          class="mt-4 text-justify leading-7 hyphens-auto text-muted-foreground"
        >
          {para}
        </p>
      {/each}

      {#if section.list && section.list.length > 0}
        <ul class="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
          {#each section.list as item, li (li)}<li class="leading-7">
              {item}
            </li>{/each}
        </ul>
      {/if}

      {#if section.table}
        <div class="mt-6 overflow-x-auto">
          <table
            class="w-full border-separate border border-border text-left text-sm"
          >
            <thead>
              <tr>
                {#each section.table.headers as entete (entete)}
                  <th
                    class="border border-border bg-muted px-3 py-2 font-semibold"
                    >{entete}</th
                  >
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each section.table.rows as ligne, ri (ri)}
                <tr class="even:bg-muted/40">
                  {#each ligne as cellule, ci (ci)}
                    <td
                      class="border border-border px-3 py-2 text-muted-foreground"
                      >{cellule}</td
                    >
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}

      {#each section.subsections ?? [] as sous, subi (subi)}
        <div>
          {#if sous.heading}
            <h3 class="mt-8 text-xl font-semibold tracking-tight 2xl:text-lg">
              {sous.heading}
            </h3>
          {/if}
          {#each sous.paragraphs as para, pi (pi)}
            <p
              class="mt-4 text-justify leading-7 hyphens-auto text-muted-foreground"
            >
              {para}
            </p>
          {/each}
          {#if sous.list && sous.list.length > 0}
            <ul class="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
              {#each sous.list as item, li (li)}<li class="leading-7">
                  {item}
                </li>{/each}
            </ul>
          {/if}
        </div>
      {/each}
    </section>
  {/each}
</article>
