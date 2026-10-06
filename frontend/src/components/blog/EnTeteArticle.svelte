<script lang="ts">
  import { i18n } from "../../lib/i18n.svelte";
  import { dateLisible, type ArticleMeta } from "../../lib/blog.svelte";

  /**
   * La ligne de métadonnées d'un article : sa date, son temps de lecture, sa
   * date de mise à jour si elle diffère, et la pastille d'un brouillon.
   * La même dans l'index et sur la page de l'article.
   */
  let { article }: { article: ArticleMeta } = $props();

  const b = $derived(i18n.t.blog);
</script>

<p
  class="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted-foreground"
>
  <time datetime={article.date}>{dateLisible(article.date, article.lang)}</time>
  <span aria-hidden="true">·</span>
  <span>{b.readingTime.replace("{n}", String(article.minutes))}</span>
  {#if article.updated !== article.date}
    <span aria-hidden="true">·</span>
    <span
      >{b.updated.split("{date}")[0]}<time datetime={article.updated}
        >{dateLisible(article.updated, article.lang)}</time
      >{b.updated.split("{date}")[1]}</span
    >
  {/if}
  {#if article.draft}
    <span class="rounded-lg border border-dashed px-1.5 text-foreground"
      >{b.draft}</span
    >
  {/if}
</p>
