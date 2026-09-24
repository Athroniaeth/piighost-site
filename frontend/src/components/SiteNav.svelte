<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import MenuIcone from "@lucide/svelte/icons/menu";
  import X from "@lucide/svelte/icons/x";
  import Logo from "./Logo.svelte";
  import Lien from "./Lien.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";
  import LangToggle from "./LangToggle.svelte";
  import Button from "../ui/Button.svelte";
  import GithubIcon from "./GithubIcon.svelte";
  import { i18n } from "../lib/i18n.svelte";
  import { router } from "../lib/router.svelte";
  import { track } from "../lib/analytics";
  import { GITHUB_ORG, HUB_URL, docsPiighost, projects } from "../lib/site";
  import { fermerAuClicDehors } from "../lib/dehors";
  import type { NomDePage } from "../lib/routes";

  const surProjet = $derived(projects.some((p) => p.slug === router.nom));

  let menuProjets = $state<HTMLDetailsElement | null>(null);
  let menuMobile = $state<HTMLDetailsElement | null>(null);

  $effect(() => {
    if (!menuProjets) return;
    return fermerAuClicDehors(menuProjets);
  });

  $effect(() => {
    if (!menuMobile) return;
    return fermerAuClicDehors(menuMobile);
  });

  // Et sur un clic *dans* le menu : la navigation est côté client, donc sans
  // ceci le menu resterait déplié par-dessus la page qu'il vient d'ouvrir.
  $effect(() => {
    // Lire la route est la dépendance de l'effet : il se rejoue à chaque
    // navigation, et referme le menu resté ouvert par dessus la page suivante.
    const route = router.nom;
    if (route && menuProjets) menuProjets.open = false;
    if (route && menuMobile) menuMobile.open = false;
  });

  function sortant(destination: string) {
    track({ name: "outbound", props: { destination, page: router.nom } });
  }

  const LIEN_NAV =
    "inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors " +
    "hover:bg-muted hover:text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

  /** Une ligne du menu sur téléphone : 44 px de haut, la cible tactile que
   *  la charte demande, et toute la largeur pour le pouce. */
  const LIEN_MOBILE =
    "flex min-h-11 items-center rounded-lg px-3 text-base font-medium transition-colors " +
    "hover:bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
</script>

<header
  class="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur"
>
  <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
    <!-- flex : un lien en ligne réserve la place des jambages sous le logo et le
         remontait d'un pixel ; en boîte flexible il est centré dans la barre. -->
    <Lien
      vers="home"
      class="flex items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Logo size={30} />
    </Lien>

    <nav
      aria-label={i18n.t.nav.mainNavigation}
      class="hidden items-center gap-1 lg:flex"
    >
      <!-- Accueil d'abord : le logo y mène aussi, mais un visiteur ne le devine
           pas, et sans ce lien la page Philosophie semblait sans retour. Puis le
           contenu du site, avant les liens qui ouvrent un onglet. -->
      <Lien vers="home" class="{LIEN_NAV} aria-[current=page]:text-primary">
        {i18n.t.nav.home}
      </Lien>
      <!-- `details` plutôt qu'un menu en JavaScript : l'ouverture au clavier, la
           fermeture par Échap et le repli sans script viennent du navigateur.
           La seule chose qu'il ne fait pas est se refermer sur un clic à côté,
           d'où les quelques lignes du script ; le reste reste au navigateur. -->
      <details class="group relative" bind:this={menuProjets}>
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

      <a
        href={docsPiighost(i18n.locale)}
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

      <!-- Sous 1024 px, les liens de la barre n'ont pas la place : ils passent
           dans ce menu. Même mécanique que le menu Projets, un `details`. -->
      <details class="group lg:hidden" bind:this={menuMobile}>
        <summary
          class="inline-flex size-9 cursor-pointer list-none items-center justify-center rounded-lg transition-colors hover:bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label={i18n.t.nav.menu}
        >
          <MenuIcone class="size-5 group-open:hidden" />
          <X class="hidden size-5 group-open:block" />
        </summary>
        <nav
          aria-label={i18n.t.nav.mainNavigation}
          class="absolute inset-x-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b bg-background px-4 pb-5 pt-2"
        >
          <p
            class="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            {i18n.t.nav.projects}
          </p>
          <ul class="mt-1 grid gap-0.5">
            {#each projects as projet (projet.slug)}
              <li>
                <Lien
                  vers={projet.slug as NomDePage}
                  class="{LIEN_MOBILE} font-mono aria-[current=page]:text-primary"
                >
                  {i18n.t.nav[projet.slug as keyof typeof i18n.t.nav] ??
                    projet.name}
                </Lien>
              </li>
            {/each}
          </ul>
          <ul class="mt-4 grid gap-0.5 border-t pt-4">
            <li>
              <Lien
                vers="home"
                class="{LIEN_MOBILE} aria-[current=page]:text-primary"
                >{i18n.t.nav.home}</Lien
              >
            </li>
            <li>
              <Lien
                vers="philosophy"
                class="{LIEN_MOBILE} aria-[current=page]:text-primary"
                >{i18n.t.nav.philosophy}</Lien
              >
            </li>
            <li>
              <a
                href={docsPiighost(i18n.locale)}
                target="_blank"
                rel="noreferrer"
                class={LIEN_MOBILE}
                onclick={() => sortant("docs")}>{i18n.t.nav.docs}</a
              >
            </li>
            <li>
              <a
                href={HUB_URL}
                target="_blank"
                rel="noreferrer"
                class={LIEN_MOBILE}
                onclick={() => sortant("hub")}>{i18n.t.nav.hub}</a
              >
            </li>
          </ul>
        </nav>
      </details>
    </div>
  </div>
</header>
