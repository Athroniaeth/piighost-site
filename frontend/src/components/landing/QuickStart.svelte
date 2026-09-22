<script lang="ts">
  import Section from "../Section.svelte";
  import Tabs from "../../ui/Tabs.svelte";
  import CodeBlock from "../../ui/CodeBlock.svelte";
  import { i18n } from "../../lib/i18n.svelte";

  const LANGCHAIN = `from langchain.agents import create_agent

from piighost.components.detector.ner import Gliner2Detector
from piighost.pipeline import ThreadAnonymizationPipeline
from piighost.integrations.langchain import PIIAnonymizationMiddleware

# Any detector works: regex, NER, or an LLM. Here a GLiNER2 NER model.
detector = Gliner2Detector("fastino/gliner2-multi-v1", labels=["PERSON", "LOCATION"])
pipeline = ThreadAnonymizationPipeline(detector)
middleware = PIIAnonymizationMiddleware(pipeline=pipeline)

agent = create_agent(
    model="openai:gpt-5.6-terra",
    tools=[lookup_city],
    middleware=[middleware],
)

# The model only sees "<<PERSON:1>>"; lookup_city still receives "Patrick".`;

  const PYDANTIC = `from pydantic_ai import Agent

from piighost.components.detector.ner import Gliner2Detector
from piighost.pipeline import ThreadAnonymizationPipeline
from piighost.integrations.pydantic_ai import pii_hooks

detector = Gliner2Detector("fastino/gliner2-multi-v1", labels=["PERSON", "LOCATION"])
pipeline = ThreadAnonymizationPipeline(detector)

# pii_hooks scopes every token to the thread id.
hooks = pii_hooks(pipeline, "thread-42")
agent = Agent("openai:gpt-5.6-terra", capabilities=[hooks])

# The model reasons over "<<PERSON:1>>"; you read "Patrick" in the reply.
result = await agent.run("Where does Patrick live?")`;

  const LLAMAINDEX = `from llama_index.core import Document, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter

from piighost.components.detector.ner import Gliner2Detector
from piighost.pipeline import ThreadAnonymizationPipeline
from piighost.integrations.llama_index import PIINodeAnonymizer, PIIQueryEngine

detector = Gliner2Detector("fastino/gliner2-multi-v1", labels=["PERSON", "LOCATION"])
pipeline = ThreadAnonymizationPipeline(detector)

# Anonymize each node before it is embedded, so the index is built on tokens.
splitter = SentenceSplitter()
index = VectorStoreIndex.from_documents(
    [Document(text="Patrick lives in Paris.")],
    transformations=[splitter, PIINodeAnonymizer(pipeline=pipeline, thread_id="docs")],
)

# The query engine anonymizes the question and restores the answer.
engine = PIIQueryEngine(inner=index.as_query_engine(), pipeline=pipeline, thread_id="docs")
answer = engine.query("Where does Patrick live?")`;

  const EXEMPLES = [
    {
      id: "langchain",
      label: "LangChain",
      install: `uv add 'piighost[langchain,gliner2]'`,
      code: LANGCHAIN,
    },
    {
      id: "pydantic",
      label: "Pydantic AI",
      install: `uv add 'piighost[pydantic-ai,gliner2]'`,
      code: PYDANTIC,
    },
    {
      id: "llamaindex",
      label: "LlamaIndex",
      install: `uv add 'piighost[llama-index,gliner2]'`,
      code: LLAMAINDEX,
    },
  ];

  const onglets = EXEMPLES.map((e) => ({ id: e.id, label: e.label }));
  let actif = $state(EXEMPLES[0].id);
</script>

<Section
  eyebrow={i18n.t.quickStart.eyebrow}
  title={i18n.t.quickStart.title}
  description={i18n.t.quickStart.description}
  centerDescription
>
  <div class="mx-auto grid max-w-3xl gap-4">
    <Tabs {onglets} bind:actif listClass="grid-cols-3">
      {#snippet children(courant)}
        {@const exemple = EXEMPLES.find((e) => e.id === courant) ?? EXEMPLES[0]}
        <div class="mt-3 grid gap-4">
          <CodeBlock code={exemple.install} language="bash" />
          <CodeBlock code={exemple.code} language="python" />
        </div>
      {/snippet}
    </Tabs>
  </div>
</Section>
