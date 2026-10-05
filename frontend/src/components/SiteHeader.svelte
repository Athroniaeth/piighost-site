<script lang="ts">
  import {
    Button,
    FlagIcon,
    GithubIcon,
    LangMenu,
    SiteNav,
    ThemeToggle,
    ecosystemLinks,
    type LocaleLink,
    type NavLink,
    type Surface,
  } from "@piighost/ui";
  import { i18n } from "../lib/i18n.svelte";
  import { router } from "../lib/router.svelte";
  import { track } from "../lib/analytics";
  import { GITHUB_ORG, projects } from "../lib/site";
  import {
    LOCALES,
    ORIGINE,
    lien,
    reconnaitre,
    type Locale,
  } from "../lib/routes";

  /**
   * La barre que partagent toutes les surfaces piighost, `SiteNav` de
   * @piighost/ui, branchée sur le routeur, la langue et la mesure du site.
   *
   * Le composant ne connaît ni routeur ni analytics : ses liens sont de vrais
   * `<a href>`. Deux choses sont donc faites ici, sans le recopier.
   *
   * - Les liens de l'écosystème visent `https://piighost.dev/{lang}/...`. Ceux
   *   qui tombent sur une page de ce site sont réécrits par `lien()` en routes
   *   relatives : l'aperçu local et le prérendu restent sur le même site.
   * - Un seul écouteur de clic, posé sur la barre, intercepte ces routes pour
   *   naviguer sans recharger, comme `Lien`, et rapporte les liens sortants.
   */

  const NOMS: Record<Locale, string> = { fr: "Français", en: "English" };

  const surface = $derived<Surface | undefined>(
    router.introuvable
      ? undefined
      : router.nom === "home"
        ? "site"
        : router.nom === "philosophy"
          ? "philosophy"
          : projects.some((p) => p.slug === router.nom)
            ? "projects"
            : undefined,
  );

  /** Une URL de piighost.dev devient la route du site, la page en cours marquée
   *  dans les sous-menus (le parent l'est déjà par `ecosystemLinks`). */
  function surLeSite(link: NavLink, enfant = false): NavLink {
    const children = link.children?.map((child) => surLeSite(child, true));
    const url = new URL(link.href);
    const page = url.origin === ORIGINE ? reconnaitre(url.pathname) : null;
    if (!page) return children ? { ...link, children } : link;
    return {
      ...link,
      href: lien(page.nom, page.locale),
      current:
        link.current ||
        (enfant && !router.introuvable && page.nom === router.nom),
      ...(children && { children }),
    };
  }

  const links = $derived(
    ecosystemLinks(surface, router.locale).map((link) => surLeSite(link)),
  );

  const locales = $derived<LocaleLink[]>(
    LOCALES.map((code) => ({
      code,
      name: NOMS[code],
      href: lien(router.nom, code),
    })),
  );

  /** Le nom de destination que la mesure connaissait déjà : docs, hub, github. */
  function destination(url: URL): string {
    if (url.hostname === "github.com") return "github";
    if (url.hostname.startsWith("docs.")) return "docs";
    if (url.hostname.startsWith("catalog.")) return "hub";
    return url.hostname;
  }

  function intercepter(barre: HTMLElement) {
    const clic = (event: MouseEvent) => {
      const a = (event.target as Element | null)?.closest("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      const url = new URL(a.href);

      if (url.origin !== location.origin) {
        track({
          name: "outbound",
          props: { destination: destination(url), page: router.nom },
        });
        return;
      }

      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0 ||
        a.target
      )
        return;
      const page = reconnaitre(url.pathname);
      if (!page) return;
      event.preventDefault();

      // La navigation est côté client : sans ceci, un menu déplié resterait
      // ouvert par-dessus la page qu'il vient d'ouvrir.
      for (const menu of barre.querySelectorAll("details[open]"))
        (menu as HTMLDetailsElement).open = false;

      // Un lien du menu des langues. Mesuré ici et non par `onswitch` de
      // LangMenu : Svelte délègue ses `onclick` à la racine, donc ce rappel
      // passe après la navigation et lirait la nouvelle langue des deux côtés.
      if (a.hreflang) {
        if (page.locale === router.locale) return;
        track({
          name: "language_switched",
          props: { from: router.locale, to: page.locale },
        });
      }
      router.aller(page.nom, page.locale);
    };
    barre.addEventListener("click", clic);
    return () => barre.removeEventListener("click", clic);
  }

  function themeChange(sombre: boolean) {
    track({ name: "theme_toggled", props: { to: sombre ? "dark" : "light" } });
  }
</script>

{#snippet boutons()}
  <Button
    variant="ghost"
    size="icon"
    href="{GITHUB_ORG}/piighost"
    target="_blank"
    rel="noreferrer"
    aria-label={i18n.t.nav.github}><GithubIcon class="size-5" /></Button
  >
  <ThemeToggle label={i18n.t.nav.toggleTheme} ontoggle={themeChange} />
{/snippet}

{#snippet controles()}
  {@render boutons()}
  <LangMenu current={router.locale} label={i18n.t.nav.language} {locales} />
{/snippet}

<!-- Dans le menu du téléphone, les deux langues sont posées à plat plutôt que
     dans LangMenu : sa liste s'ouvre vers la gauche depuis un bouton calé à
     gauche, et le défilement du menu la coupe. Deux liens de 44 px, la langue
     en cours marquée, même mécanique de clic que le menu des langues. -->
{#snippet controlesMenu()}
  {@render boutons()}
  <span class="ms-auto flex items-center gap-1">
    {#each locales as locale (locale.code)}
      <a
        href={locale.href}
        hreflang={locale.code}
        lang={locale.code}
        aria-current={locale.code === router.locale ? "true" : undefined}
        class="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=true]:text-primary"
      >
        <FlagIcon locale={locale.code} class="size-4" />
        {locale.name}
      </a>
    {/each}
  </span>
{/snippet}

<!-- `contents` : la boîte n'existe pas pour la mise en page, donc la barre
     collante garde la page entière pour bloc conteneur, et l'écouteur reçoit
     quand même les clics qui remontent. -->
<div class="contents" {@attach intercepter}>
  <SiteNav
    homeHref={lien("home", router.locale)}
    {links}
    menuActions={controlesMenu}
    mainNavigationLabel={i18n.t.nav.mainNavigation}
    menuLabel={i18n.t.nav.menu}
  >
    {#snippet actions()}
      <span class="hidden items-center gap-1 lg:flex"
        >{@render controles()}</span
      >
    {/snippet}
  </SiteNav>
</div>
