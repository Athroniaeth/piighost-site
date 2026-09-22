import { pythonTokens } from "../frontend/src/lib/highlight.ts";
import { writeFileSync } from "node:fs";

const SNIPPET = `from langchain.agents import create_agent

from piighost.components.detector.ner import Gliner2Detector
from piighost.pipeline import ThreadAnonymizationPipeline

# Any detector works: regex, NER, or an LLM. Here a GLiNER2 NER model.
detector = Gliner2Detector("fastino/gliner2-multi-v1", labels=["PERSON"])
pipeline = ThreadAnonymizationPipeline(detector)

agent = create_agent(
    model="openai:gpt-5.6-terra",
    tools=[lookup_city],
    middleware=[PIIAnonymizationMiddleware(pipeline=pipeline)],
)

# The model only sees "<<PERSON:1>>"; lookup_city still receives "Patrick".`;

const echapper = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const html = pythonTokens(SNIPPET)
  .map((t) => `<span class="tok-${t.kind}">${echapper(t.text)}</span>`)
  .join("");
writeFileSync("/tmp/snippet.html", html);
console.log("jetons :", pythonTokens(SNIPPET).length);
console.log("types  :", [...new Set(pythonTokens(SNIPPET).map((t) => t.kind))].join(" "));
