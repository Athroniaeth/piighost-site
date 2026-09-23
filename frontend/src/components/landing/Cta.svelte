<script lang="ts">
  import BookOpen from "@lucide/svelte/icons/book-open";
  import Button from "../../ui/Button.svelte";
  import CopyButton from "../../ui/CopyButton.svelte";
  import Ghost from "../Ghost.svelte";
  import GithubIcon from "../GithubIcon.svelte";
  import { i18n } from "../../lib/i18n.svelte";
  import { GITHUB_ORG, docsPiighost } from "../../lib/site";

  /**
   * La page se referme sur la phrase qui l'ouvre.
   *
   * Le slogan du bandeau revient ici, avec sa seconde moitié en violet, et la
   * section se pose sur le semis de points au lieu d'un bandeau gris : la fin
   * de page appartient au même fond que le reste. La commande d'installation
   * est copiable, c'est le premier geste qu'on attend du lecteur arrivé là.
   *
   * Deux onglets, uv par défaut : c'est l'outil que le démarrage rapide et la
   * page projet emploient déjà, pip reste à un clic. Le bouton copier suit
   * l'onglet actif. Le nom du paquet reste piighost tant que la bibliothèque
   * n'est pas renommée.
   */
  const OUTILS = [
    { id: "uv", commande: "uv add piighost" },
    { id: "pip", commande: "pip install piighost" },
  ] as const;
  let outil = $state<(typeof OUTILS)[number]["id"]>("uv");
  const commande = $derived(
    OUTILS.find((o) => o.id === outil)?.commande ?? OUTILS[0].commande,
  );
</script>

<section
  id="get-started"
  class="flex scroll-mt-16 flex-col justify-center md:min-h-[calc(100dvh-4rem)]"
>
  <div class="mx-auto w-full max-w-3xl px-6 py-20 text-center">
    <Ghost class="mx-auto mb-6 size-14 text-primary" />
    <h2
      class="text-4xl font-bold leading-[1.1] tracking-[-0.03em] sm:text-[2.75rem]"
    >
      {i18n.t.hero.sloganWork}<br /><span class="text-primary"
        >{i18n.t.hero.sloganStay}</span
      >
    </h2>
    <p
      class="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground"
    >
      {i18n.t.cta.title}
      {i18n.t.cta.description}
    </p>
    <div
      class="mx-auto mt-7 inline-flex items-center gap-3 rounded-lg border bg-card p-1 pr-1 font-mono text-sm"
    >
      <div
        role="tablist"
        aria-label={i18n.t.cta.packageManager}
        class="flex gap-0.5 rounded-md bg-muted p-0.5"
      >
        {#each OUTILS as o (o.id)}
          <button
            type="button"
            role="tab"
            aria-selected={outil === o.id}
            class={[
              "rounded px-2.5 py-1 text-xs transition-colors",
              outil === o.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ]}
            onclick={() => (outil = o.id)}>{o.id}</button
          >
        {/each}
      </div>
      <span role="tabpanel"
        ><span class="mr-2 text-muted-foreground" aria-hidden="true">$</span
        >{commande}</span
      >
      <CopyButton value={commande} class="size-8" />
    </div>
    <div class="mt-7 flex flex-wrap justify-center gap-3">
      <Button
        size="xl"
        href={docsPiighost(i18n.locale)}
        target="_blank"
        rel="noreferrer"
      >
        <BookOpen class="mr-2 size-5" />
        {i18n.t.cta.readTheDocs}
      </Button>
      <Button
        size="xl"
        variant="outline"
        href="{GITHUB_ORG}/piighost"
        target="_blank"
        rel="noreferrer"
      >
        <GithubIcon class="mr-2 size-5" />
        {i18n.t.cta.starOnGitHub}
      </Button>
    </div>
  </div>
</section>
