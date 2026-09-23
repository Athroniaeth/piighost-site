<script lang="ts">
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import Button from "../../ui/Button.svelte";
  import FenetreCode from "../FenetreCode.svelte";
  import MarqueIcone from "../MarqueIcone.svelte";
  import { i18n } from "../../lib/i18n.svelte";
  import { lien } from "../../lib/routes";
  import { docsPiighost } from "../../lib/site";

  /**
   * Le bandeau montre du code, pas une carte.
   *
   * piighost est une bibliothèque qu'on installe et qu'on branche : une fenêtre
   * d'éditeur dit ce que c'est en une seconde, là où une carte flottante ne dit
   * rien. Et l'extrait porte l'argument central du produit, « votre code
   * d'agent ne change pas », en le montrant au lieu de l'affirmer.
   */
  // Le commentaire suit la langue de la page, le code reste celui du paquet.
  const EXTRAIT = $derived(`from langchain.agents import create_agent
from piighost.integrations.langchain import PIIAnonymizationMiddleware

middleware = PIIAnonymizationMiddleware(pipeline=pipeline)

agent = create_agent(
    model="openai:gpt-5.6",
    tools=[send_email],
    middleware=[middleware],
)
# ${i18n.t.hero.codeComment}`);

  const MARQUES = [
    { cle: "langchain", nom: "LangChain" },
    { cle: "pydantic", nom: "Pydantic AI" },
    { cle: "llamaindex", nom: "LlamaIndex" },
  ] as const;
</script>

<section
  id="overview"
  class="relative flex scroll-mt-16 items-center overflow-hidden border-b md:min-h-[calc(100dvh-4rem)]"
>
  <div
    class="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1fr_1.05fr]"
  >
    <div>
      <!-- Le nom et le slogan sont dans le même h1. Affiché, c'est deux lignes
           de tailles différentes ; lu par un robot, c'est un seul titre qui
           porte le nom et la promesse, au lieu du nom seul. -->
      <h1 class="tracking-[-0.035em]">
        <span
          class="block text-4xl font-bold sm:text-[3.25rem] sm:leading-[1.05]"
        >
          {i18n.t.hero.name}
        </span>
        <span
          class="mt-3 block text-xl font-semibold tracking-[-0.025em] sm:text-[1.75rem] lg:whitespace-nowrap"
        >
          {i18n.t.hero.sloganWork}
          <!-- Sous 1024 px, chaque moitié sur sa ligne : coupée par le retour
               automatique, la phrase laissait « restent. » seul au bout. -->
          <span class="block text-primary lg:inline"
            >{i18n.t.hero.sloganStay}</span
          >
        </span>
      </h1>
      <p
        class="mt-6 max-w-[46ch] sm:text-justify text-lg leading-relaxed hyphens-auto text-muted-foreground"
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
          href={docsPiighost(i18n.locale)}
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
