<script lang="ts">
  import Bande from "../components/Bande.svelte";
  import StepChip from "../ui/StepChip.svelte";
  import { t } from "../lib/i18n.svelte";

  const BLOCS = [
    { titre: "philosophy.1.title", corps: "philosophy.1.body" },
    { titre: "philosophy.2.title", corps: "philosophy.2.body" },
    { titre: "philosophy.3.title", corps: "philosophy.3.body" },
  ] as const;
</script>

<header class="mx-auto max-w-6xl px-5 pt-14 pb-16">
  <h1 class="max-w-[18ch] text-[2.125rem] leading-[1.05] font-semibold tracking-[-0.035em] sm:text-[2.5rem]">
    {t("philosophy.title")}
  </h1>
  <p class="mt-4 max-w-[62ch] text-[0.975rem] leading-relaxed text-muted-foreground">
    {t("philosophy.lede")}
  </p>
</header>

<Bande>{t("philosophy.band")}</Bande>
<div class="mx-auto max-w-6xl px-5 py-4">
  <div class="rounded-lg border bg-card">
    {#each BLOCS as bloc, i (bloc.titre)}
      <!-- Une seule carte, des filets entre les blocs : trois cartes flottantes
           seraient le motif que le brief range dans ce qu'il exclut. -->
      <section class="grid gap-3 border-t p-4 first:border-t-0 sm:grid-cols-[auto_1fr] sm:gap-5">
        <div class="pt-0.5"><StepChip n={i + 1} /></div>
        <div>
          <h2 class="text-[1.0625rem] font-semibold tracking-[-0.02em]">{t(bloc.titre)}</h2>
          <p class="mt-1.5 max-w-[84ch] text-[0.8125rem] leading-relaxed text-muted-foreground">
            {t(bloc.corps)}
          </p>
        </div>
      </section>
    {/each}
  </div>
</div>
