<script lang="ts">
  import BookOpen from "@lucide/svelte/icons/book-open";
  import Button from "../../ui/Button.svelte";
  import GithubIcon from "../GithubIcon.svelte";
  import { i18n } from "../../lib/i18n.svelte";
  import { GITHUB_ORG } from "../../lib/site";
</script>

<section id="get-started" class="scroll-mt-16 border-t bg-muted/30">
  <div class="mx-auto max-w-3xl px-4 py-20 text-center">
    <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
      {i18n.t.cta.title}
    </h2>
    <p class="mt-4 text-muted-foreground">{i18n.t.cta.description}</p>
    <div class="mt-8 flex justify-center gap-3">
      <Button
        size="xl"
        href="https://athroniaeth.github.io/piighost/"
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
