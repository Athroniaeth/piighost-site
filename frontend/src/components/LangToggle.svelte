<script lang="ts">
  import Check from "@lucide/svelte/icons/check";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import FlagIcon from "./FlagIcon.svelte";
  import { router } from "../lib/router.svelte";
  import { LOCALES, lien, type Locale } from "../lib/routes";
  import { i18n } from "../lib/i18n.svelte";
  import { track } from "../lib/analytics";
  import { fermerAuClicDehors } from "../lib/dehors";

  /**
   * Le choix de la langue, en liste plutôt qu'en bascule.
   *
   * Une bascule ne dit ni où l'on est ni ce qui existe : elle affiche l'autre
   * langue, ce qui se lit aussi bien comme « vous êtes en anglais ». La liste
   * montre les deux, coche celle en cours, et n'a plus rien à deviner.
   *
   * Chaque entrée reste un vrai lien vers la route traduite, comme la bascule
   * l'était : c'est ce qui permet à un robot de découvrir l'autre version, en
   * plus des `hreflang` du head. Un `select` HTML ne peut contenir ni lien ni
   * drapeau dessiné — d'où le `details`, la mécanique du menu des projets.
   *
   * Le nom de chaque langue est écrit dans cette langue : quelqu'un qui cherche
   * la sienne balaie le mot qu'il écrirait, pas sa traduction.
   */
  const NOMS: Record<Locale, string> = { fr: "Français", en: "English" };

  let menu = $state<HTMLDetailsElement | null>(null);

  $effect(() => {
    if (!menu) return;
    return fermerAuClicDehors(menu);
  });
  $effect(() => {
    // Lire la route est la dépendance de l'effet : il se rejoue à chaque
    // navigation, et referme le menu resté ouvert par dessus la page suivante.
    const route = router.locale;
    if (route && menu) menu.open = false;
  });

  function choisir(cible: Locale) {
    return (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.button !== 0) return;
      event.preventDefault();
      if (cible === router.locale) {
        if (menu) menu.open = false;
        return;
      }
      const depuis = router.locale;
      router.basculerLangue();
      track({ name: "language_switched", props: { from: depuis, to: cible } });
    };
  }
</script>

<details class="group relative" bind:this={menu}>
  <summary
    class="inline-flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-lg px-2.5
           text-sm font-medium transition-colors hover:bg-muted hover:text-foreground
           outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    aria-label={i18n.t.nav.language}
  >
    <FlagIcon locale={router.locale} class="size-4" />
    <span class="hidden sm:inline">{NOMS[router.locale]}</span>
    <ChevronDown class="size-3.5 transition-transform group-open:rotate-180" />
  </summary>

  <ul
    class="absolute right-0 mt-1.5 grid min-w-[180px] gap-1 rounded-lg border bg-popover p-1"
  >
    {#each LOCALES as locale (locale)}
      <li>
        <a
          href={lien(router.nom, locale)}
          hreflang={locale}
          lang={locale}
          onclick={choisir(locale)}
          aria-current={locale === router.locale ? "true" : undefined}
          class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-popover-foreground
                 hover:bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <FlagIcon {locale} class="size-4" />
          <span>{NOMS[locale]}</span>
          {#if locale === router.locale}
            <Check class="ms-auto size-3.5 text-primary" />
          {/if}
        </a>
      </li>
    {/each}
  </ul>
</details>
