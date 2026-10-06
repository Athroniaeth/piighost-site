<script lang="ts">
  import Rss from "@lucide/svelte/icons/rss";
  import Lien from "../components/Lien.svelte";
  import Etiquettes from "../components/blog/Etiquettes.svelte";
  import EnTeteArticle from "../components/blog/EnTeteArticle.svelte";
  import { i18n } from "../lib/i18n.svelte";
  import { articlesDe, lienFlux } from "../lib/blog.svelte";

  /**
   * L'index du blog d'une langue, le plus récent d'abord.
   *
   * La même colonne de lecture que la page philosophie. Chaque entrée dit ce
   * qu'un lecteur doit savoir pour choisir : le titre, la date, le temps de
   * lecture, ce qu'il apprendra, les sujets.
   */
  const b = $derived(i18n.t.blog);
  const articles = $derived(articlesDe(i18n.locale));
</script>

<div class="feuille mx-auto max-w-3xl px-4 py-16">
  <header class="mb-12 text-center">
    <p class="mb-2 text-sm font-semibold tracking-wide text-primary">
      {b.eyebrow}
    </p>
    <h1 class="text-4xl font-bold tracking-tight sm:text-5xl 2xl:text-4xl">
      {b.title}
    </h1>
    <p
      class="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground 2xl:text-base"
    >
      {b.intro}
    </p>
    <a
      href={lienFlux(i18n.locale)}
      type="application/atom+xml"
      class="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      ><Rss class="size-4" aria-hidden="true" />{b.feed}</a
    >
  </header>

  {#if articles.length}
    <ol class="divide-y border-y">
      {#each articles as article (article.slug)}
        <li class="py-8">
          <article class="space-y-3">
            <EnTeteArticle {article} />
            <h2 class="text-2xl font-semibold tracking-tight break-words">
              <Lien
                vers="blog"
                article={article.slug}
                class="hover:text-primary hover:underline">{article.title}</Lien
              >
            </h2>
            <p class="leading-7 text-muted-foreground">
              {article.description}
            </p>
            <Etiquettes tags={article.tags} label={b.tags} />
          </article>
        </li>
      {/each}
    </ol>
  {:else}
    <p class="border-y py-12 text-center text-muted-foreground">{b.empty}</p>
  {/if}
</div>
