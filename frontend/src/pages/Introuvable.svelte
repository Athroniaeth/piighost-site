<script lang="ts">
  import Button from "../ui/Button.svelte";
  import Ghost from "../components/Ghost.svelte";
  import { router, localePreferee } from "../lib/router.svelte";
  import { lien } from "../lib/routes";

  /**
   * La page d'erreur, reprise du site actuel, y compris sa copie en anglais :
   * elle n'est pas dans le dictionnaire là-bas non plus, et une URL inconnue
   * n'a pas de langue.
   *
   * Le fantôme y porte la couleur de la marque, qui est celle des actions
   * depuis que le corail est retiré. Voir CHARTE.md section 2.
   */
  const accueil = lien("home", router.locale ?? localePreferee());
</script>

<div
  class="mx-auto flex max-w-3xl flex-col items-center px-4 py-32 text-center"
>
  <Ghost size={64} class="text-primary" />
  <p class="mt-6 font-mono text-6xl font-bold text-primary">404</p>
  <h1 class="mt-4 text-2xl font-semibold">
    This page slipped past the placeholder
  </h1>
  <p class="mt-2 text-muted-foreground">
    The page you are looking for does not exist.
  </p>
  <Button
    class="mt-8"
    href={accueil}
    onclick={(e: MouseEvent) => {
      e.preventDefault();
      router.aller("home");
    }}
  >
    Back home
  </Button>
</div>
