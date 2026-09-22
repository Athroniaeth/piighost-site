<script lang="ts">
  import Sun from "@lucide/svelte/icons/sun";
  import Moon from "@lucide/svelte/icons/moon";
  import Button from "../ui/Button.svelte";
  import { theme } from "../lib/theme.svelte";
  import { t } from "../lib/i18n.svelte";
  import { track } from "../lib/analytics";

  function basculer() {
    theme.toggle();
    track({ name: "theme_toggled", props: { to: theme.dark ? "dark" : "light" } });
  }
</script>

<Button variant="ghost" size="icon" onclick={basculer} aria-label={t("nav.theme")}>
  {#if theme.dark}<Sun />{:else}<Moon />{/if}
</Button>
