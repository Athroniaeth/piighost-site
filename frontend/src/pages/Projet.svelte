<script lang="ts">
  import Button from "../ui/Button.svelte";
  import CodeBlock from "../ui/CodeBlock.svelte";
  import Github from "../components/GithubIcon.svelte";
  import ExternalLink from "@lucide/svelte/icons/external-link";
  import { t, tProjet } from "../lib/i18n.svelte";
  import { router } from "../lib/router.svelte";
  import { track } from "../lib/analytics";

  type Slug = "piighost" | "api" | "chat" | "proofreader";
  let { slug }: { slug: Slug } = $props();

  /** Ce qui distingue chaque projet : son dépôt, son adresse, son installation. */
  const FICHES: Record<
    Slug,
    { depot: string; site: string | null; install: string | null; langage: "python" | "toml" }
  > = {
    piighost: {
      depot: "https://github.com/Athroniaeth/piighost",
      site: "https://athroniaeth.github.io/piighost/",
      install: "pip install piighost",
      langage: "python",
    },
    api: {
      depot: "https://github.com/Athroniaeth/piighost-api",
      site: null,
      install: "docker run ghcr.io/athroniaeth/piighost-api",
      langage: "python",
    },
    chat: {
      depot: "https://github.com/Athroniaeth/piighost-chat",
      site: "https://chat.piighost.dev",
      install: null,
      langage: "python",
    },
    proofreader: {
      depot: "https://github.com/Athroniaeth/piighost-proofreader",
      site: null,
      install: null,
      langage: "python",
    },
  };

  const fiche = $derived(FICHES[slug]);
</script>

<article class="mx-auto max-w-3xl px-5 py-16 lg:py-24">
  <h1 class="font-mono text-[2rem] leading-tight font-semibold tracking-[-0.03em]">
    {tProjet(slug, "title")}
  </h1>
  <p class="mt-5 text-[1.0625rem] leading-relaxed text-muted-foreground">
    {tProjet(slug, "lede")}
  </p>

  <div class="mt-7 flex flex-wrap gap-2.5">
    <Button
      href={fiche.depot}
      variant="outline"
      onclick={() => track({ name: "outbound", props: { destination: slug + ":repo", page: router.nom } })}
    >
      <Github />
      {t("project.repo")}
    </Button>
    {#if fiche.site}
      <Button
        href={fiche.site}
        onclick={() => track({ name: "outbound", props: { destination: slug + ":site", page: router.nom } })}
      >
        <ExternalLink />
        {t("project.open")}
      </Button>
    {/if}
  </div>

  {#if fiche.install}
    <div class="mt-9">
      <p class="mb-2.5 font-mono text-[0.625rem] tracking-[0.12em] text-muted-foreground uppercase">
        {t("project.install")}
      </p>
      <CodeBlock code={fiche.install} language={fiche.langage} />
    </div>
  {/if}
</article>
