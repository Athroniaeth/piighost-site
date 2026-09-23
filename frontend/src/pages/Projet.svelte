<script lang="ts">
  import ProjectHeader from "../components/ProjectHeader.svelte";
  import ProjectArticle from "../components/ProjectArticle.svelte";
  import CodeBlock from "../ui/CodeBlock.svelte";
  import { getProject } from "../lib/site";
  import { i18n } from "../lib/i18n.svelte";

  type Slug = "piighost" | "api" | "chat" | "proofreader";
  let { slug }: { slug: Slug } = $props();

  // Le code du README de la bibliothèque, vérifié contre ses imports : les
  // chemins et les signatures changent, un extrait recopié de mémoire casse.
  // Le commentaire suit la langue de la page.
  const USAGE = $derived(`from langchain.agents import create_agent

from piighost.components.detector import ExactMatchDetector
from piighost.integrations.langchain import PIIAnonymizationMiddleware
from piighost.pipeline import ThreadAnonymizationPipeline

# ${i18n.t.quickStart.code.anyDetector}
detector = ExactMatchDetector({"Patrick": "PERSON"})
pipeline = ThreadAnonymizationPipeline(detector)
middleware = PIIAnonymizationMiddleware(pipeline)

agent = create_agent(
    model="openai:gpt-5.6-terra",
    tools=[send_email],
    middleware=[middleware],
)`);

  const REQUETE = `POST /v1/anonymize
{ "text": "Email Patrick at patrick@acme.com" }

200 OK
{ "anonymized_text": "Email <<PERSON:1>> at <<EMAIL:1>>", "entities": [ ... ] }`;

  const project = $derived(getProject(slug));
</script>

{#snippet piighostInstall()}
  <CodeBlock code="uv add 'piighost[langchain]'" language="bash" />
{/snippet}
{#snippet piighostUsage()}
  <CodeBlock code={USAGE} language="python" />
{/snippet}
{#snippet apiQuickstart()}
  <CodeBlock
    code={`uv add piighost-api
piighost-api serve pipeline:pipeline --port 8000`}
    language="bash"
  />
{/snippet}
{#snippet apiRequest()}
  <CodeBlock code={REQUETE} />
{/snippet}
{#snippet chatRun()}
  <CodeBlock
    code={`git clone https://github.com/Athroniaeth/piighost-chat
cd piighost-chat
docker compose up`}
    language="bash"
  />
{/snippet}
{#snippet proofreaderRun()}
  <CodeBlock
    code={`uv sync --group dev
cp .env.example .env  # fill in LITELLM_API_KEY etc.
uv run streamlit run app.py`}
    language="bash"
  />
{/snippet}

<ProjectHeader {project} />
{#if slug === "piighost"}
  <ProjectArticle
    {slug}
    blocs={{ install: piighostInstall, usage: piighostUsage }}
  />
{:else if slug === "api"}
  <ProjectArticle
    {slug}
    blocs={{ quickstart: apiQuickstart, request: apiRequest }}
  />
{:else if slug === "chat"}
  <ProjectArticle {slug} blocs={{ run: chatRun }} />
{:else}
  <ProjectArticle {slug} blocs={{ run: proofreaderRun }} />
{/if}
