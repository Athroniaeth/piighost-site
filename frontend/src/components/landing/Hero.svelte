<script lang="ts">
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Button from "../../ui/Button.svelte";
  import FenetreCode from "../FenetreCode.svelte";
  import MarqueIcone from "../MarqueIcone.svelte";
  import { i18n } from "../../lib/i18n.svelte";
  import { lien } from "../../lib/routes";
  import { getProject } from "../../lib/site";

  /**
   * Le bandeau montre du code, pas une carte.
   *
   * piighost est une bibliothèque qu'on installe et qu'on branche : une fenêtre
   * d'éditeur dit ce que c'est en une seconde, là où une carte flottante ne dit
   * rien. Et l'extrait porte l'argument central du produit, « votre code
   * d'agent ne change pas », en le montrant au lieu de l'affirmer.
   */
  const EXTRAIT = `from langchain.agents import create_agent
from piighost.middleware import PIIAnonymizationMiddleware

middleware = PIIAnonymizationMiddleware(pipeline=pipeline)

agent = create_agent(
    model="openai:gpt-5.6",
    tools=[send_email],
    middleware=[middleware],
)
# le modele ne voit que des jetons ; send_email recoit les vraies valeurs`;

  const MARQUES = [
    { cle: "langchain", nom: "LangChain" },
    { cle: "pydantic", nom: "Pydantic AI" },
    { cle: "llamaindex", nom: "LlamaIndex" },
  ] as const;
</script>

<section
  id="overview"
  class="relative flex min-h-[calc(100dvh-4rem)] scroll-mt-16 items-center overflow-hidden border-b"
>
  <div
    class="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1fr_1.05fr]"
  >
    <div>
      <h1
        class="text-4xl leading-[1.04] font-bold tracking-[-0.04em] sm:text-6xl"
      >
        {i18n.t.hero.title}
      </h1>
      <p
        class="mt-7 max-w-[46ch] text-lg leading-relaxed text-muted-foreground"
      >
        {i18n.t.hero.description}
      </p>

      <div class="mt-9 flex flex-wrap gap-3">
        <Button size="xl" href={lien("piighost", i18n.locale)}>
          {i18n.t.hero.getStarted}
          <ArrowRight class="ml-2 size-5" />
        </Button>
        <Button
          size="xl"
          variant="outline"
          href={getProject("piighost").docs}
          target="_blank"
          rel="noreferrer"
        >
          {i18n.t.hero.docs}
        </Button>
      </div>

      <div class="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
        <p class="text-sm text-muted-foreground">{i18n.t.hero.worksWith}</p>
        <ul class="flex flex-wrap items-center gap-6">
          {#each MARQUES as marque (marque.cle)}
            <li class="flex items-center gap-2 font-semibold">
              <MarqueIcone
                marque={marque.cle}
                class="size-6 shrink-0 rounded-[0.3rem]"
              />
              {marque.nom}
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <FenetreCode code={EXTRAIT}>
      {#snippet onglets()}
        <span
          class="border-b border-card bg-card px-4 py-2.5 font-mono text-[0.8125rem] text-foreground"
          >agent.py</span
        >
        <span
          class="px-4 py-2.5 font-mono text-[0.8125rem] text-muted-foreground"
          >pipeline.py</span
        >
      {/snippet}
    </FenetreCode>
  </div>
</section>
