<script lang="ts">
  import { router } from "./lib/router.svelte";
  import { t } from "./lib/i18n.svelte";
</script>

<main class="mx-auto max-w-3xl p-8">
  <h1 class="text-4xl font-semibold tracking-tight">{t("home.title")}</h1>
  <p class="mt-4 text-muted-foreground">{t("home.lede")}</p>
  <p class="mt-6 font-mono text-sm">route : {router.nom} / {router.locale}</p>
</main>
