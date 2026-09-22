<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Lien from "./Lien.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";
  import LangToggle from "./LangToggle.svelte";
  import Button from "../ui/Button.svelte";
  import GithubIcon from "./GithubIcon.svelte";
  import { i18n } from "../lib/i18n.svelte";
  import { router } from "../lib/router.svelte";
  import { track } from "../lib/analytics";
  import { GITHUB_ORG, HUB_URL, getProject, projects } from "../lib/site";
  import type { NomDePage } from "../lib/routes";

  const surProjet = $derived(projects.some((p) => p.slug === router.nom));

  function sortant(destination: string) {
    track({ name: "outbound", props: { destination, page: router.nom } });
  }

  const LIEN_NAV =
    "inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors " +
    "hover:bg-muted hover:text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
</script>

<header
  class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur"
>
  <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
    <Lien
      vers="home"
      class="rounded-md font-mono text-lg font-bold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      piighost
    </Lien>

    <nav
      aria-label={i18n.t.nav.mainNavigation}
      class="hidden items-center gap-1 md:flex"
    >
      <Lien vers="home" class="{LIEN_NAV} aria-[current=page]:text-primary">
        {i18n.t.nav.home}
      </Lien>

      <a
        href={getProject("piighost").docs}
        target="_blank"
        rel="noreferrer"
        class={LIEN_NAV}
        onclick={() => sortant("docs")}
      >
        {i18n.t.nav.docs}
      </a>

      <a
        href={HUB_URL}
        target="_blank"
        rel="noreferrer"
        class={LIEN_NAV}
        onclick={() => sortant("hub")}
      >
        {i18n.t.nav.hub}
      </a>

      <!-- `details` plutôt qu'un menu en JavaScript : l'ouverture au clavier, la
           fermeture par Échap et le repli sans script viennent du navigateur. -->
      <details class="group relative">
        <summary
          class="{LIEN_NAV} cursor-pointer list-none gap-1 {surProjet
            ? 'text-primary'
            : ''}"
        >
          {i18n.t.nav.projects}
          <ChevronDown
            class="size-3.5 transition-transform group-open:rotate-180"
          />
        </summary>
        <ul
          class="absolute left-0 mt-1.5 grid min-w-[280px] gap-1 rounded-lg border bg-popover p-1"
        >
          {#each projects as projet (projet.slug)}
            <li>
              <Lien
                vers={projet.slug as NomDePage}
                class="flex flex-col gap-0.5 rounded-md px-2.5 py-1.5 text-popover-foreground
                       hover:bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span class="font-mono text-sm font-medium">
                  {i18n.t.nav[projet.slug as keyof typeof i18n.t.nav] ??
                    projet.name}
                </span>
                <span class="text-xs text-muted-foreground">
                  {i18n.t.projects[projet.slug as keyof typeof i18n.t.projects]
                    ?.tagline ?? projet.tagline}
                </span>
              </Lien>
            </li>
          {/each}
        </ul>
      </details>

      <Lien
        vers="philosophy"
        class="{LIEN_NAV} aria-[current=page]:text-primary"
      >
        {i18n.t.nav.philosophy}
      </Lien>
    </nav>

    <div class="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        href="{GITHUB_ORG}/piighost"
        target="_blank"
        rel="noreferrer"
        aria-label={i18n.t.nav.github}
        onclick={() => sortant("github")}
      >
        <GithubIcon class="size-5" />
      </Button>
      <ThemeToggle />
      <LangToggle />
    </div>
  </div>
</header>
