<script lang="ts">
  import type { Snippet } from "svelte";

  /**
   * Une section de la page d'accueil : un écran, un sujet.
   *
   * La hauteur minimale donne le rythme d'une section par écran ;
   * `scroll-mt-16` réserve la hauteur de la barre collante, sans quoi un titre
   * visé par une ancre atterrit dessous.
   *
   * Un filet en bas, comme sous le bandeau : chaque section est séparée de la
   * suivante. L'appel final n'en porte pas, le pied de page trace le sien.
   */
  let {
    id = undefined,
    eyebrow = "",
    title = "",
    description = "",
    centerDescription = false,
    children,
  }: {
    id?: string;
    eyebrow?: string;
    title?: string;
    description?: string;
    centerDescription?: boolean;
    children?: Snippet;
  } = $props();
</script>

<section
  {id}
  class="flex scroll-mt-16 flex-col justify-center border-b md:min-h-[calc(100dvh-4rem)]"
>
  <div class="mx-auto w-full max-w-7xl px-6 py-16">
    {#if eyebrow || title || description}
      <div class="mb-12">
        {#if eyebrow || title}
          <div class="text-center">
            {#if eyebrow}
              <p
                class="mb-2 text-sm font-semibold uppercase tracking-wide text-primary"
              >
                {eyebrow}
              </p>
            {/if}
            {#if title}
              <h2
                class="mx-auto max-w-5xl text-balance text-3xl font-bold tracking-tight sm:text-4xl"
              >
                {title}
              </h2>
            {/if}
          </div>
        {/if}
        {#if description}
          <p
            class={centerDescription
              ? "mx-auto mt-4 max-w-2xl text-center text-muted-foreground"
              : "mx-auto mt-4 max-w-2xl sm:text-justify hyphens-auto text-muted-foreground"}
          >
            {description}
          </p>
        {/if}
      </div>
    {/if}
    {@render children?.()}
  </div>
</section>
