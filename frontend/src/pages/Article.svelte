<script lang="ts">
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import Languages from "@lucide/svelte/icons/languages";
  import { Content } from "@piighost/ui";
  import Lien from "../components/Lien.svelte";
  import Etiquettes from "../components/blog/Etiquettes.svelte";
  import EnTeteArticle from "../components/blog/EnTeteArticle.svelte";
  import { i18n } from "../lib/i18n.svelte";
  import { contenu, trouver } from "../lib/blog.svelte";
  import { LOCALES } from "../lib/routes";

  /**
   * Un article du blog, dans la colonne de lecture de la page philosophie.
   *
   * Le corps est l'arbre construit au build par frontend/blog/build.ts et
   * rendu par `Content` de @piighost/ui : les blocs de code sont le vrai
   * CodeBlock, bouton de copie compris. Il arrive dans un module à part.
   * Le prérendu et l'hydratation l'attendent, une navigation dans le site
   * l'affiche dès qu'il est chargé.
   */
  let { slug }: { slug: string } = $props();

  const b = $derived(i18n.t.blog);
  const article = $derived(trouver(i18n.locale, slug));
  const noeuds = $derived(contenu(i18n.locale, slug));
  const autre = $derived(LOCALES.find((l) => l !== i18n.locale));
  const traduit = $derived(autre && trouver(autre, slug) ? autre : undefined);

  const RETOUR =
    "inline-flex min-h-10 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground";
</script>

{#if article}
  <article class="feuille mx-auto max-w-3xl px-4 py-16">
    <nav aria-label={b.breadcrumb} class="mb-8">
      <Lien vers="blog" class={RETOUR}
        ><ArrowLeft class="size-4" aria-hidden="true" />{b.allArticles}</Lien
      >
    </nav>

    <header class="mb-12 space-y-4 border-b pb-8">
      <EnTeteArticle {article} />
      <h1
        class="text-3xl font-bold tracking-tight text-balance break-words sm:text-4xl"
      >
        {article.title}
      </h1>
      <p class="text-lg leading-relaxed text-muted-foreground 2xl:text-base">
        {article.description}
      </p>
      <Etiquettes tags={article.tags} label={b.tags} />
      {#if traduit}
        <Lien
          vers="blog"
          article={slug}
          locale={traduit}
          lang={traduit}
          hreflang={traduit}
          class={RETOUR}
          ><Languages
            class="size-4"
            aria-hidden="true"
          />{b.otherLanguage}</Lien
        >
      {/if}
    </header>

    <div class="prose-piighost">
      {#if noeuds}
        <Content nodes={noeuds} copyLabel={b.copy} copiedLabel={b.copied} />
      {/if}
    </div>

    <footer class="mt-16 border-t pt-8">
      <Lien vers="blog" class={RETOUR}
        ><ArrowLeft class="size-4" aria-hidden="true" />{b.allArticles}</Lien
      >
    </footer>
  </article>
{/if}
