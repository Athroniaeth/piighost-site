<script lang="ts">
  import Button from "../ui/Button.svelte";
  import StepChip from "../ui/StepChip.svelte";
  import CodeBlock from "../ui/CodeBlock.svelte";
  import Substitution from "../components/Substitution.svelte";
  import Section from "../components/Section.svelte";
  import ProjetCarte from "../components/ProjetCarte.svelte";
  import Github from "../components/GithubIcon.svelte";
  import Check from "@lucide/svelte/icons/check";
  import { t } from "../lib/i18n.svelte";
  import { router } from "../lib/router.svelte";
  import { track } from "../lib/analytics";

  const ETAPES = [
    { n: 1, titre: "home.how.1.title", corps: "home.how.1.body" },
    { n: 2, titre: "home.how.2.title", corps: "home.how.2.body" },
    { n: 3, titre: "home.how.3.title", corps: "home.how.3.body" },
  ] as const;

  const CONFIANCE = ["home.trust.1", "home.trust.2", "home.trust.3", "home.trust.4"] as const;
  const PROJETS = ["piighost", "api", "chat", "proofreader"] as const;

  const INSTALL = `pip install piighost`;
</script>

<section class="mx-auto grid max-w-6xl gap-11 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
  <div>
    <h1 class="text-[2.25rem] leading-[1.04] font-semibold tracking-[-0.04em] sm:text-[3rem]">
      {t("home.title")}
    </h1>
    <p class="mt-5 max-w-[52ch] text-[1.0625rem] leading-relaxed text-muted-foreground">
      {t("home.lede")}
    </p>
    <div class="mt-7 flex flex-wrap gap-2.5">
      <Button
        size="xl"
        href="https://athroniaeth.github.io/piighost/"
        onclick={() => track({ name: "outbound", props: { destination: "docs", page: router.nom } })}
      >
        {t("home.cta.start")}
      </Button>
      <Button
        size="xl"
        variant="outline"
        href="https://github.com/Athroniaeth/piighost"
        onclick={() => track({ name: "outbound", props: { destination: "github", page: router.nom } })}
      >
        <Github />
        {t("home.cta.github")}
      </Button>
    </div>
    <div class="mt-7 max-w-md">
      <CodeBlock code={INSTALL} language="python" />
    </div>
  </div>

  <Substitution />
</section>

<Section kicker={t("home.how.kicker")} title={t("home.how.title")} lede={t("home.how.lede")}>
  <ol class="grid gap-5 sm:grid-cols-3">
    {#each ETAPES as etape (etape.n)}
      <li class="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div class="flex items-center gap-2.5">
          <StepChip n={etape.n} />
          <h3 class="text-base font-semibold">{t(etape.titre)}</h3>
        </div>
        <p class="mt-3 text-[0.85rem] leading-relaxed text-muted-foreground">{t(etape.corps)}</p>
      </li>
    {/each}
  </ol>
</Section>

<!-- La limite avant l'argument : c'est la règle d'écriture de la charte, et
     c'est aussi ce que le README du produit fait lui-même. -->
<Section kicker={t("home.limit.kicker")} title={t("home.limit.title")}>
  <p class="max-w-[72ch] text-[0.95rem] leading-relaxed text-muted-foreground">
    {t("home.limit.body")}
  </p>
</Section>

<Section kicker={t("home.eco.kicker")} title={t("home.eco.title")} lede={t("home.eco.lede")}>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {#each PROJETS as projet (projet)}
      <ProjetCarte slug={projet} />
    {/each}
  </div>

  <ul class="mt-9 flex flex-wrap gap-x-7 gap-y-2.5">
    {#each CONFIANCE as cle (cle)}
      <li class="flex items-center gap-2 text-[0.85rem] text-muted-foreground">
        <Check class="size-3.5 text-primary" aria-hidden="true" />
        {t(cle)}
      </li>
    {/each}
  </ul>
</Section>
