<script lang="ts">
  import Logo from "./Logo.svelte";
  import Lien from "./Lien.svelte";
  import { i18n } from "../lib/i18n.svelte";
  import { GITHUB_ORG, HUB_URL, projects } from "../lib/site";
  import type { NomDePage } from "../lib/routes";

  /** Sur téléphone, chaque lien prend 40 px de haut : une liste serrée de
   *  liens de 20 px est la cible tactile la plus ratée d'une page. */
  const EXTERNE =
    "hover:text-foreground max-sm:inline-flex max-sm:min-h-10 max-sm:items-center";
</script>

<footer class="border-t">
  <div class="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-3">
    <div>
      <Logo size={22} />
      <p class="mt-2 max-w-xs text-sm text-muted-foreground">
        {i18n.t.footer.tagline}
      </p>
    </div>
    <div>
      <p class="text-sm font-semibold">{i18n.t.footer.projects}</p>
      <ul class="mt-3 space-y-2 text-sm text-muted-foreground max-sm:space-y-0">
        {#each projects as projet (projet.slug)}
          <li>
            <Lien vers={projet.slug as NomDePage} class={EXTERNE}
              >{projet.name}</Lien
            >
          </li>
        {/each}
      </ul>
    </div>
    <div>
      <p class="text-sm font-semibold">{i18n.t.footer.links}</p>
      <ul class="mt-3 space-y-2 text-sm text-muted-foreground max-sm:space-y-0">
        <li>
          <a
            class={EXTERNE}
            href="{GITHUB_ORG}/piighost"
            target="_blank"
            rel="noreferrer">GitHub</a
          >
        </li>
        <li>
          <a
            class={EXTERNE}
            href="https://pypi.org/project/piighost/"
            target="_blank"
            rel="noreferrer">PyPI</a
          >
        </li>
        <li>
          <a
            class={EXTERNE}
            href="https://athroniaeth.github.io/piighost/"
            target="_blank"
            rel="noreferrer">Documentation</a
          >
        </li>
        <li>
          <a class={EXTERNE} href={HUB_URL} target="_blank" rel="noreferrer"
            >{i18n.t.nav.hub}</a
          >
        </li>
      </ul>
    </div>
  </div>
  <div class="border-t py-6 text-center text-xs text-muted-foreground">
    {i18n.t.footer.mit}
  </div>
</footer>
