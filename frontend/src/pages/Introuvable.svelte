<script lang="ts">
  import Button from "../ui/Button.svelte";
  import Ghost from "../components/Ghost.svelte";
  import { t } from "../lib/i18n.svelte";
  import { router, localePreferee } from "../lib/router.svelte";
  import { lien } from "../lib/routes";
</script>

<article class="mx-auto flex max-w-lg flex-col items-center gap-4 px-5 py-28 text-center">
  <Ghost size={44} class="text-muted-foreground/40" />
  <h1 class="text-[1.75rem] font-semibold tracking-[-0.03em]">{t("404.title")}</h1>
  <p class="text-[0.95rem] leading-relaxed text-muted-foreground">{t("404.body")}</p>
  <Button
    class="mt-2"
    href={lien("home", router.locale ?? localePreferee())}
    onclick={(e: MouseEvent) => {
      e.preventDefault();
      router.aller("home");
    }}
  >
    {t("404.back")}
  </Button>
</article>
