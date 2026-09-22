<script lang="ts">
  import ArrowUp from "@lucide/svelte/icons/arrow-up";
  import Button from "../ui/Button.svelte";
  import { i18n } from "../lib/i18n.svelte";
  import { cn } from "../lib/cn";

  /** Le retour en haut, qui n'apparaît qu'une fois le premier écran passé. */
  let visible = $state(false);

  $effect(() => {
    const auDefilement = () => (visible = scrollY > innerHeight * 0.5);
    auDefilement();
    addEventListener("scroll", auDefilement, { passive: true });
    return () => removeEventListener("scroll", auDefilement);
  });
</script>

<Button
  aria-label={i18n.t.nav.backToTop}
  size="icon-lg"
  onclick={() => scrollTo({ top: 0, behavior: "smooth" })}
  class={cn(
    "fixed bottom-6 right-6 z-40 size-12 rounded-full shadow-lg transition-opacity duration-300",
    visible ? "opacity-100" : "pointer-events-none opacity-0",
  )}
>
  <ArrowUp class="size-5" />
</Button>
