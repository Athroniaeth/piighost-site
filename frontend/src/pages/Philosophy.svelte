<script lang="ts">
  import { t } from "../lib/i18n.svelte";

  const BLOCS = [
    { titre: "philosophy.1.title", corps: "philosophy.1.body" },
    { titre: "philosophy.2.title", corps: "philosophy.2.body" },
    { titre: "philosophy.3.title", corps: "philosophy.3.body" },
  ] as const;
</script>

<article class="mx-auto max-w-3xl px-5 py-16 lg:py-24">
  <h1 class="text-[2.25rem] leading-[1.06] font-semibold tracking-[-0.035em]">
    {t("philosophy.title")}
  </h1>
  <p class="mt-5 text-[1.0625rem] leading-relaxed text-muted-foreground">
    {t("philosophy.lede")}
  </p>

  {#each BLOCS as bloc (bloc.titre)}
    <section class="mt-11 border-t pt-8">
      <h2 class="text-[1.375rem] font-semibold tracking-[-0.025em]">{t(bloc.titre)}</h2>
      <p class="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">{t(bloc.corps)}</p>
    </section>
  {/each}
</article>
