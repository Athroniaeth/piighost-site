<script lang="ts">
  import Section from "../Section.svelte";
  import FenetreCode from "../FenetreCode.svelte";
  import MarqueIcone from "../MarqueIcone.svelte";
  import { i18n } from "../../lib/i18n.svelte";

  /**
   * Trois frameworks, un onglet chacun, dans la fenêtre d'éditeur du bandeau.
   *
   * Les lignes marquées sont celles qu'apporte piighost : le texte promet
   * « votre code d'agent reste le même », et le marquage le montre au lieu de
   * l'affirmer. Les numéros suivent les extraits ligne à ligne, ils se
   * recomptent à chaque modification d'un extrait.
   *
   * Les commentaires et les chaînes d'exemple suivent la langue de la page ;
   * le code, lui, est celui du paquet, vérifié contre ses imports.
   */
  const c = $derived(i18n.t.quickStart.code);

  const exemples = $derived([
    {
      id: "langchain",
      marque: "langchain",
      nom: "LangChain",
      commande: `uv add 'piighost[langchain,gliner2]'`,
      ajouts: [3, 4, 5, 6, 7, 8, 9, 10, 15],
      code: `from langchain.agents import create_agent

from piighost.components.detector.ner import Gliner2Detector
from piighost.pipeline import ThreadAnonymizationPipeline
from piighost.integrations.langchain import PIIAnonymizationMiddleware

# ${c.anyDetector}
detector = Gliner2Detector("fastino/gliner2-multi-v1", labels=["PERSON", "LOCATION"])
pipeline = ThreadAnonymizationPipeline(detector)
middleware = PIIAnonymizationMiddleware(pipeline=pipeline)

agent = create_agent(
    model="openai:gpt-5.6-terra",
    tools=[lookup_city],
    middleware=[middleware],
)

# ${c.langchainResult}`,
    },
    {
      id: "pydantic",
      marque: "pydantic",
      nom: "Pydantic AI",
      commande: `uv add 'piighost[pydantic-ai,gliner2]'`,
      ajouts: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      code: `from pydantic_ai import Agent

from piighost.components.detector.ner import Gliner2Detector
from piighost.pipeline import ThreadAnonymizationPipeline
from piighost.integrations.pydantic_ai import pii_hooks

detector = Gliner2Detector("fastino/gliner2-multi-v1", labels=["PERSON", "LOCATION"])
pipeline = ThreadAnonymizationPipeline(detector)

# ${c.pydanticScope}
hooks = pii_hooks(pipeline, "thread-42")
agent = Agent("openai:gpt-5.6-terra", capabilities=[hooks])

# ${c.pydanticResult}
result = await agent.run("${c.question}")`,
    },
    {
      id: "llamaindex",
      marque: "llamaindex",
      nom: "LlamaIndex",
      commande: `uv add 'piighost[llama-index,gliner2]'`,
      ajouts: [4, 5, 6, 7, 8, 9, 11, 15, 18, 19],
      code: `from llama_index.core import Document, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter

from piighost.components.detector.ner import Gliner2Detector
from piighost.pipeline import ThreadAnonymizationPipeline
from piighost.integrations.llama_index import PIINodeAnonymizer, PIIQueryEngine

detector = Gliner2Detector("fastino/gliner2-multi-v1", labels=["PERSON", "LOCATION"])
pipeline = ThreadAnonymizationPipeline(detector)

# ${c.llamaNodes}
splitter = SentenceSplitter()
index = VectorStoreIndex.from_documents(
    [Document(text="${c.document}")],
    transformations=[splitter, PIINodeAnonymizer(pipeline=pipeline, thread_id="docs")],
)

# ${c.llamaQuery}
engine = PIIQueryEngine(inner=index.as_query_engine(), pipeline=pipeline, thread_id="docs")
answer = engine.query("${c.question}")`,
    },
  ] as const);

  let actif = $state<string>("langchain");
  const courant = $derived(exemples.find((e) => e.id === actif) ?? exemples[0]);

  /** Les flèches passent d'un onglet à l'autre, comme dans le reste du site. */
  function clavier(event: KeyboardEvent) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const i = exemples.findIndex((e) => e.id === actif);
    const pas = event.key === "ArrowRight" ? 1 : -1;
    actif = exemples[(i + pas + exemples.length) % exemples.length].id;
    const liste = (event.currentTarget as HTMLElement).parentElement;
    liste?.querySelector<HTMLButtonElement>(`#qs-${actif}`)?.focus();
  }
</script>

<Section
  id="quick-start"
  eyebrow={i18n.t.quickStart.eyebrow}
  title={i18n.t.quickStart.title}
  description={i18n.t.quickStart.description}
  centerDescription
>
  <div class="mx-auto max-w-[52rem]">
    <FenetreCode
      code={courant.code}
      commande={courant.commande}
      ajouts={[...courant.ajouts]}
    >
      {#snippet onglets()}
        <div role="tablist" class="flex overflow-x-auto">
          {#each exemples as exemple (exemple.id)}
            <button
              id="qs-{exemple.id}"
              type="button"
              role="tab"
              aria-selected={exemple.id === actif}
              tabindex={exemple.id === actif ? 0 : -1}
              onclick={() => (actif = exemple.id)}
              onkeydown={clavier}
              class={[
                "flex shrink-0 items-center gap-2 border-r border-foreground/15 px-4 py-2.5 text-[0.8125rem] transition-colors",
                exemple.id === actif
                  ? "-mb-px bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ]}
            >
              <MarqueIcone
                marque={exemple.marque}
                class="size-4 shrink-0 rounded-[0.2rem]"
              />
              {exemple.nom}
            </button>
          {/each}
        </div>
      {/snippet}
    </FenetreCode>
    <div
      class="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-muted-foreground"
    >
      <span class="flex items-center gap-2"
        ><span
          class="size-3 rounded-[0.2rem] bg-primary/30 shadow-[inset_3px_0_0_var(--primary)]"
          aria-hidden="true"
        ></span>{i18n.t.quickStart.added}</span
      >
      <span>{i18n.t.quickStart.unchanged}</span>
    </div>
  </div>
</Section>
