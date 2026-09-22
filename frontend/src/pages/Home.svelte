<script lang="ts">
  import Button from "../ui/Button.svelte";
  import Bande from "../components/Bande.svelte";
  import Panneau from "../components/Panneau.svelte";
  import Rangee from "../components/Rangee.svelte";
  import Substitution from "../components/Substitution.svelte";
  import GithubIcon from "../components/GithubIcon.svelte";
  import Lien from "../components/Lien.svelte";
  import { t, tProjet } from "../lib/i18n.svelte";
  import { router } from "../lib/router.svelte";
  import { track } from "../lib/analytics";
  import { entityClass, dotClass } from "../lib/labels";
  import type { NomDePage } from "../lib/routes";

  /** Les détecteurs réellement livrés, tels que le README les nomme. */
  const DETECTEURS = [
    ["regex", "generic, us, eu, fr"],
    ["gliner2", "NER"],
    ["spacy", "NER"],
    ["transformers", "NER"],
    ["llm", "modèle"],
    ["exact", "correspondance"],
    ["composite", "combinaison"],
    ["chunked", "hors contexte"],
  ] as const;

  const SUBSTITUTIONS = [
    { teinte: 1, clair: "John Doe", jeton: "<<PERSON:1>>" },
    { teinte: 4, clair: "john.doe@example.com", jeton: "<<EMAIL:1>>" },
    { teinte: 6, clair: "FR76 3000 6000 01", jeton: "<<IBAN:1>>" },
  ] as const;

  const INTEGRATIONS = [
    ["langchain", "middleware"],
    ["pydantic-ai", "hooks"],
    ["llamaindex", "callback"],
    ["openai", "proxy compatible"],
    ["anthropic", "proxy compatible"],
    ["claude-code", "intégration"],
  ] as const;

  const PROJETS: NomDePage[] = ["piighost", "api", "chat", "proofreader"];
  const sortant = (d: string) => track({ name: "outbound", props: { destination: d, page: router.nom } });
</script>

<section class="mx-auto grid max-w-6xl gap-10 px-5 pt-14 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
  <div>
    <h1 class="text-[2.125rem] leading-[1.04] font-semibold tracking-[-0.04em] sm:text-[2.875rem]">
      {t("home.title")}
    </h1>
    <p class="mt-4 max-w-[52ch] text-[0.975rem] leading-relaxed text-muted-foreground">
      {t("home.lede")}
    </p>
    <div class="mt-6 flex flex-wrap items-center gap-2">
      <Button size="lg" href="https://athroniaeth.github.io/piighost/" onclick={() => sortant("docs")}>
        {t("home.cta.start")}
      </Button>
      <Button size="lg" variant="outline" href="https://github.com/Athroniaeth/piighost" onclick={() => sortant("github")}>
        <GithubIcon class="size-4" />
        {t("home.cta.github")}
      </Button>
      <code class="ml-1 font-mono text-[0.8125rem] text-muted-foreground">pip install piighost</code>
    </div>
  </div>

  <Substitution />
</section>

<Bande>{t("meca.band")}</Bande>
<div class="mx-auto grid max-w-6xl gap-3 px-5 py-4 lg:grid-cols-3">
  <Panneau etape={1} titre={t("meca.1")}>
    <div class="grid font-mono text-[0.75rem] sm:grid-cols-2 sm:gap-x-6">
      {#each DETECTEURS as [nom, role], i (nom)}
        <div class={i < 2 ? "[&>*]:border-t-0" : ""}>
          <Rangee code={role}>{nom}</Rangee>
        </div>
      {/each}
    </div>
    <p class="mt-3 text-[0.75rem] leading-relaxed text-muted-foreground">{t("meca.1.note")}</p>
  </Panneau>

  <Panneau etape={2} titre={t("meca.2")}>
    <div class="flex flex-col gap-2 font-mono text-[0.75rem]">
      {#each SUBSTITUTIONS as s (s.clair)}
        <div class="flex flex-wrap items-center gap-1.5">
          <mark class="rounded-[3px] px-1.5 py-px {entityClass(s.teinte, 'valeur')}">{s.clair}</mark>
          <span class="text-muted-foreground">{t("meca.2.of")}</span>
          <mark class="rounded-[3px] px-1.5 py-px {entityClass(s.teinte, 'jeton')}">{s.jeton}</mark>
        </div>
      {/each}
    </div>
    <p class="mt-3 text-[0.75rem] leading-relaxed text-muted-foreground">{t("meca.2.note")}</p>
  </Panneau>

  <Panneau etape={3} titre={t("meca.3")}>
    <div class="flex flex-col gap-2 font-mono text-[0.75rem]">
      {#each SUBSTITUTIONS as s (s.clair)}
        <div class="flex flex-wrap items-center gap-1.5">
          <mark class="rounded-[3px] px-1.5 py-px {entityClass(s.teinte, 'jeton')}">{s.jeton}</mark>
          <span class="text-muted-foreground">{t("meca.3.of")}</span>
          <mark class="rounded-[3px] px-1.5 py-px {entityClass(s.teinte, 'valeur')}">{s.clair}</mark>
        </div>
      {/each}
    </div>
    <p class="mt-3 text-[0.75rem] leading-relaxed text-muted-foreground">{t("meca.3.note")}</p>
  </Panneau>
</div>

<Bande>{t("integ.band")}</Bande>
<div class="mx-auto max-w-6xl px-5 py-4">
  <div class="rounded-lg border bg-card p-4">
    <ul class="flex flex-wrap gap-1.5">
      {#each INTEGRATIONS as [nom, role] (nom)}
        <li
          class="flex items-baseline gap-1.5 rounded border bg-background px-2 py-1 font-mono text-[0.75rem]"
        >
          {nom}<span class="text-[0.6875rem] text-muted-foreground">{role}</span>
        </li>
      {/each}
    </ul>
    <p class="mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground">{t("integ.note")}</p>
  </div>
</div>

<Bande>{t("eco.band")}</Bande>
<div class="mx-auto max-w-6xl px-5 py-4">
  <div class="rounded-lg border bg-card px-4 py-1">
    {#each PROJETS as projet, i (projet)}
      <Rangee puce={dotClass(i + 1)} href={`/${router.locale}/projects/${projet}`}>
        <span class="font-mono text-[0.8125rem] font-medium">{tProjet(projet as never, "title")}</span>
        <span class="hidden truncate text-[0.8125rem] text-muted-foreground sm:inline">
          {tProjet(projet as never, "lede")}
        </span>
      </Rangee>
    {/each}
  </div>
</div>

<Bande>{t("limit.band")}</Bande>
<div class="mx-auto max-w-6xl px-5 py-4">
  <div class="rounded-lg border bg-card p-4">
    <h2 class="text-[1.0625rem] font-semibold tracking-[-0.02em]">{t("home.limit.title")}</h2>
    <p class="mt-2 max-w-[86ch] text-[0.8125rem] leading-relaxed text-muted-foreground">
      {t("home.limit.body")}
    </p>
    <p class="mt-3 border-t pt-3 font-mono text-[0.75rem] text-muted-foreground">{t("limit.see")}</p>
  </div>
</div>
