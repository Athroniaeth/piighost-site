<script lang="ts">
  import Button from "../ui/Button.svelte";
  import { router } from "../lib/router.svelte";
  import { LOCALES, lien } from "../lib/routes";
  import { t } from "../lib/i18n.svelte";
  import { track } from "../lib/analytics";

  const autre = $derived(LOCALES.find((l) => l !== router.locale) ?? "en");

  function basculer(event: MouseEvent) {
    if (event.metaKey || event.ctrlKey || event.button !== 0) return;
    event.preventDefault();
    const depuis = router.locale;
    router.basculerLangue();
    track({ name: "language_switched", props: { from: depuis, to: autre } });
  }
</script>

<!-- Un vrai lien vers l'autre langue, pas un bouton : c'est ce qui permet à un
     robot de découvrir la version traduite, en plus des balises hreflang. -->
<Button
  variant="ghost"
  size="sm"
  href={lien(router.nom, autre)}
  onclick={basculer}
  aria-label={t("nav.language")}
  hreflang={autre}
>
  {autre.toUpperCase()}
</Button>
