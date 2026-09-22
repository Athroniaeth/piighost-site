<script lang="ts">
  import Button from "../ui/Button.svelte";
  import Bande from "../components/Bande.svelte";
  import Rangee from "../components/Rangee.svelte";
  import GithubIcon from "../components/GithubIcon.svelte";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import { t, tProjet } from "../lib/i18n.svelte";
  import { router } from "../lib/router.svelte";
  import { track } from "../lib/analytics";

  type Slug = "piighost" | "api" | "chat" | "proofreader";
  let { slug }: { slug: Slug } = $props();

  /** Ce qui distingue chaque projet : son dépôt, son adresse, son installation. */
  const FICHES: Record<Slug, { depot: string; site: string | null; install: string | null }> = {
    piighost: {
      depot: "Athroniaeth/piighost",
      site: "https://athroniaeth.github.io/piighost/",
      install: "pip install piighost",
    },
    api: {
      depot: "Athroniaeth/piighost-api",
      site: null,
      install: "docker run ghcr.io/athroniaeth/piighost-api",
    },
    chat: { depot: "Athroniaeth/piighost-chat", site: "https://chat.piighost.dev", install: null },
    proofreader: { depot: "Athroniaeth/piighost-proofreader", site: null, install: null },
  };

  const fiche = $derived(FICHES[slug]);
  const urlDepot = $derived(`https://github.com/${fiche.depot}`);
  const sortant = (d: string) => track({ name: "outbound", props: { destination: d, page: router.nom } });
</script>

<header class="mx-auto max-w-6xl px-5 pt-14 pb-16">
  <h1 class="font-mono text-[1.875rem] leading-tight font-semibold tracking-[-0.03em]">
    {tProjet(slug, "title")}
  </h1>
  <p class="mt-4 max-w-[62ch] text-[0.975rem] leading-relaxed text-muted-foreground">
    {tProjet(slug, "lede")}
  </p>
  <div class="mt-6 flex flex-wrap gap-2">
    <Button size="lg" variant="outline" href={urlDepot} onclick={() => sortant(slug + ":repo")}>
      <GithubIcon class="size-4" />
      {t("project.repo")}
    </Button>
    {#if fiche.site}
      <Button size="lg" href={fiche.site} onclick={() => sortant(slug + ":site")}>
        <ExternalLink />
        {t("project.open")}
      </Button>
    {/if}
  </div>
</header>

<Bande>{t("project.band")}</Bande>
<div class="mx-auto max-w-6xl px-5 py-4">
  <div class="rounded-lg border bg-card px-4 py-1">
    <Rangee code={fiche.depot}>{t("project.repo")}</Rangee>
    {#if fiche.site}
      <Rangee code={fiche.site.replace(/^https?:\/\//, "")}>{t("project.site")}</Rangee>
    {/if}
    {#if fiche.install}
      <Rangee code={fiche.install}>{t("project.install")}</Rangee>
    {/if}
    <Rangee code="MIT">{t("project.licence")}</Rangee>
  </div>
</div>
