<script lang="ts">
  import Rocket from "@lucide/svelte/icons/rocket";
  import Button from "../../ui/Button.svelte";
  import GithubIcon from "../GithubIcon.svelte";
  import AnonymizeFlow from "../AnonymizeFlow.svelte";
  import { i18n } from "../../lib/i18n.svelte";
  import { lien } from "../../lib/routes";
  import { GITHUB_ORG } from "../../lib/site";
</script>

<section
  class="relative flex min-h-[calc(100dvh-4rem)] snap-start scroll-mt-16 items-center overflow-hidden border-b"
>
  <div class="halo-primaire pointer-events-none absolute inset-0"></div>
  <div
    class="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2"
  >
    <div>
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
        {i18n.t.hero.title}
      </h1>
      <p class="mt-6 max-w-xl text-lg text-muted-foreground">
        {i18n.t.hero.description}
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <Button size="xl" href={lien("piighost", i18n.locale)}>
          <Rocket class="mr-2 size-5" />
          {i18n.t.hero.getStarted}
        </Button>
        <Button
          size="xl"
          variant="outline"
          href="{GITHUB_ORG}/piighost"
          target="_blank"
          rel="noreferrer"
        >
          <GithubIcon class="mr-2 size-5" />
          {i18n.t.hero.github}
        </Button>
      </div>
    </div>
    <AnonymizeFlow />
  </div>
</section>
