<script lang="ts">
  import Logo from "./Logo.svelte";
  import Lien from "./Lien.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";
  import LangToggle from "./LangToggle.svelte";
  import Button from "../ui/Button.svelte";
  import Github from "./GithubIcon.svelte";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import { t } from "../lib/i18n.svelte";
  import { router } from "../lib/router.svelte";
  import { track } from "../lib/analytics";
  import type { NomDePage } from "../lib/routes";

  const PROJETS: NomDePage[] = ["piighost", "api", "chat", "proofreader"];
  const surProjet = $derived((PROJETS as string[]).includes(router.nom));

  function sortant(destination: string) {
    track({ name: "outbound", props: { destination, page: router.nom } });
  }
</script>

<a
  href="#contenu"
  class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:ring-3 focus:ring-ring/50"
>
  {t("nav.skip")}
</a>

<header class="sticky top-0 z-40 border-b bg-sidebar">
  <nav
    class="mx-auto flex h-14 max-w-6xl items-center gap-5 px-5"
    aria-label={t("nav.menu")}
  >
    <Lien vers="home" class="mr-1 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <Logo />
    </Lien>

    <!-- `details` plutôt qu'un menu en JavaScript : l'ouverture au clavier, la
         fermeture par Échap et le repli sans script viennent du navigateur. -->
    <details class="group relative hidden sm:block">
      <summary
        class="flex cursor-pointer list-none items-center gap-1 rounded-md px-1.5 py-1 text-sm
               {surProjet ? 'font-semibold text-foreground' : 'text-muted-foreground'}
               hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
      >
        {t("nav.projects")}
        <ChevronDown class="size-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <div
        class="absolute left-0 mt-1.5 flex w-60 flex-col gap-0.5 rounded-lg border bg-popover p-1.5"
      >
        {#each PROJETS as projet (projet)}
          <Lien
            vers={projet}
            class="rounded-md px-2.5 py-1.5 text-sm text-popover-foreground hover:bg-accent
                   aria-[current=page]:font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {t(`project.${projet}.title`)}
          </Lien>
        {/each}
      </div>
    </details>

    <Lien
      vers="philosophy"
      class="hidden rounded-md px-1.5 py-1 text-sm text-muted-foreground hover:text-foreground
             aria-[current=page]:font-semibold aria-[current=page]:text-foreground sm:block
             outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {t("nav.philosophy")}
    </Lien>

    <a
      href="https://athroniaeth.github.io/piighost/"
      class="hidden rounded-md px-1.5 py-1 text-sm text-muted-foreground hover:text-foreground sm:block
             outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      onclick={() => sortant("docs")}
    >
      {t("nav.docs")}
    </a>

    <div class="ml-auto flex items-center gap-1">
      <LangToggle />
      <ThemeToggle />
      <Button
        variant="ghost"
        size="icon"
        href="https://github.com/Athroniaeth/piighost"
        aria-label={t("nav.github")}
        onclick={() => sortant("github")}
      >
        <Github />
      </Button>
    </div>
  </nav>
</header>
