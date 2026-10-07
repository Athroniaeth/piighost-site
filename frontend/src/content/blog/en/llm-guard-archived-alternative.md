---
title: "LLM Guard is archived: here's another open-source alternative to protect personal data"
description: "LLM Guard was archived in July 2026. Migrate its Anonymize and Deanonymize scanners to piighost, and pick a maintained tool for its other scanners."
date: 2026-10-07
lang: en
slug: llm-guard-archived-alternative
tags: [llm, privacy, pii, llm-guard, migration]
author: Athroniaeth
draft: false
---

[LLM Guard](https://github.com/protectai/llm-guard) was archived on 9 July 2026. Its README now opens with a warning. "This project and its associated models on Hugging Face are no longer under active development or maintained." If your prompts go through its Anonymize scanner, that code will get no more fixes.

I maintain `piighost`, an open-source library that does one part of what LLM Guard did. It de-identifies personal data before the prompt reaches the model, which means it replaces each value with a placeholder, a token that takes its place. It then restores the real values in the reply. `piighost` is under the MIT license, first shipped on PyPI on 23 March 2026, and I am its only maintainer. This article shows how to migrate that part, and what to use for the rest of LLM Guard.

## What LLM Guard was

LLM Guard is a Python toolkit by Protect AI. It runs scanners on the prompt before the model call and on the reply after it, 15 on input and 21 on output. [pypistats](https://pypistats.org/packages/llm-guard) still counts 106,172 downloads over the last month.

Two scanners handle personal data:

- [Anonymize](https://protectai.github.io/llm-guard/input_scanners/anonymize/) detects values with Presidio, a transformers NER model and regexes. NER (named entity recognition) labels words as a person, a place or an organization. Each value becomes a placeholder such as `[REDACTED_PERSON_1]`.
- [Deanonymize](https://protectai.github.io/llm-guard/output_scanners/deanonymize/) puts the real values back in the model's reply.

Both share a `Vault`, a Python list of placeholder and value pairs kept in memory ([source](https://github.com/protectai/llm-guard/blob/main/llm_guard/vault.py)).

## What the archive changes

An archived repository is read-only, so nobody can merge a fix. The last release on PyPI is 0.3.16, from 19 May 2025. Four later fixes on the main branch never shipped ([#271](https://github.com/protectai/llm-guard/pull/271), [#268](https://github.com/protectai/llm-guard/pull/268), [#272](https://github.com/protectai/llm-guard/pull/272), [#283](https://github.com/protectai/llm-guard/pull/283)). One of them makes placeholders consistent for identical values.

Version 0.3.16 pins `presidio-anonymizer==2.2.358`, which pins `cryptography<44.1`. [CVE-2026-26007](https://github.com/advisories/GHSA-r6ph-v2qm-q3c2), a high-severity flaw in cryptography, is fixed in version 46.0.5. [Issue #342](https://github.com/protectai/llm-guard/issues/342) asked in May 2026 for the pin to be relaxed, and stays open. The resolver confirms the conflict, in a Python 3.12 virtual environment:

```text
$ uv pip install --dry-run "llm-guard==0.3.16" "cryptography>=46.0.5"
error: No solution found when resolving dependencies
  cause: Because presidio-anonymizer==2.2.358 depends on cryptography<44.1 and llm-guard>=0.3.16 depends on presidio-anonymizer==2.2.358, we can conclude that llm-guard>=0.3.16 depends on cryptography<44.1.
         And because you require llm-guard==0.3.16 and cryptography>=46.0.5, we can conclude that your requirements are unsatisfiable.
```

Python 3.13 is blocked too. Version 0.3.16 declares `Requires-Python >=3.10,<3.13`, and the older releases that pip falls back to fail to build. I ran the LLM Guard code below on Python 3.12.

Palo Alto Networks [bought](https://www.paloaltonetworks.com/company/press/2025/palo-alto-networks-completes-acquisition-of-protect-ai) Protect AI in July 2025 and folded the technology into Prisma AIRS, its commercial AI security platform. No fork has taken over. The most starred fork pushed since the archive had 2 stars on 6 October 2026.

## Anonymize and Deanonymize, side by side

### Before, with LLM Guard

This code follows the LLM Guard docs. `fake_llm` stands in for the model.

```python
from llm_guard.input_scanners import Anonymize
from llm_guard.output_scanners import Deanonymize
from llm_guard.input_scanners.anonymize_helpers import BERT_LARGE_NER_CONF
from llm_guard.vault import Vault

vault = Vault()
anonymize = Anonymize(vault, recognizer_conf=BERT_LARGE_NER_CONF, language="en")
deanonymize = Deanonymize(vault)


def fake_llm(prompt: str) -> str:
    """Stands in for the model: answers with the placeholders it was given."""
    return "Done. I wrote to [REDACTED_PERSON_1] at [REDACTED_EMAIL_ADDRESS_1]."


prompt = "Email John Doe at john.doe@example.com about the invoice."
sanitized, is_valid, risk = anonymize.scan(prompt)
print("sent to LLM :", sanitized)

answer = deanonymize.scan(sanitized, fake_llm(sanitized))[0]
print("user reads  :", answer)
print("vault       :", vault.get())

# Second turn, same vault: is John Doe still [REDACTED_PERSON_1]?
sanitized_2, _, _ = anonymize.scan("Also tell John Doe that Jane Smith joins the call.")
print("turn 2      :", sanitized_2)

# A sentence the model gets wrong, on a fresh vault.
miss, _, _ = Anonymize(Vault(), recognizer_conf=BERT_LARGE_NER_CONF, language="en").scan(
    "Email John Doe about the invoice."
)
print("miss        :", miss)
```

The output, with LLM Guard's log lines removed:

```text
sent to LLM : Email [REDACTED_PERSON_1] at [REDACTED_EMAIL_ADDRESS_1] about the invoice.
user reads  : Done. I wrote to John Doe at john.doe@example.com.
vault       : [('[REDACTED_EMAIL_ADDRESS_1]', 'john.doe@example.com'), ('[REDACTED_PERSON_1]', 'John Doe')]
turn 2      : Also tell [REDACTED_PERSON_1] that [REDACTED_PERSON_2] joins the call.
miss        : Email John [REDACTED_PERSON_1]e about the invoice.
```

### After, with piighost

The `piighost` version keeps the same NER model, `dslim/bert-large-NER`. It adds the `generic` group of the [catalog](https://catalog.piighost.dev), the collection of regex patterns that `piighost` pulls by group. A thread pipeline replaces the vault. It keeps one mapping per conversation, identified by a `thread_id`.

```python
import asyncio

from piighost.components.detector import CompositeDetector, RegexDetector
from piighost.components.detector.ner import TransformersDetector
from piighost.pipeline import ThreadAnonymizationPipeline

names = TransformersDetector(
    "dslim/bert-large-NER",
    labels={"PERSON": "PER", "LOCATION": "LOC", "ORGANIZATION": "ORG"},
)
formats = RegexDetector.from_catalog("catalog:piighost/generic")
pipeline = ThreadAnonymizationPipeline(CompositeDetector([names, formats]))


def fake_llm(prompt: str) -> str:
    """Stands in for the model: answers with the placeholders it was given."""
    return "Done. I wrote to <<PERSON:1>> at <<EMAIL:1>>."


async def main() -> None:
    prompt = "Email John Doe at john.doe@example.com about the invoice."
    safe = await pipeline.anonymize(prompt, thread_id="thread-42")
    print("sent to LLM :", safe.text)

    answer = await pipeline.deanonymize(fake_llm(safe.text), thread_id="thread-42")
    print("user reads  :", answer)

    # Second turn, same thread: is John Doe still <<PERSON:1>>?
    turn_2 = await pipeline.anonymize(
        "Also tell John Doe that Jane Smith joins the call.", thread_id="thread-42"
    )
    print("turn 2      :", turn_2.text)

    # Another conversation starts its own numbering.
    other = await pipeline.anonymize("Call Jane Smith.", thread_id="thread-43")
    print("thread-43   :", other.text)

    # A sentence the model gets wrong, on a fresh thread.
    miss = await pipeline.anonymize("Email John Doe about the invoice.", thread_id="thread-44")
    print("miss        :", miss.text)


asyncio.run(main())
```

The output, with `piighost` 2.0.1 on Python 3.13:

```text
sent to LLM : Email <<PERSON:1>> at <<EMAIL:1>> about the invoice.
user reads  : Done. I wrote to John Doe at john.doe@example.com.
turn 2      : Also tell <<PERSON:1>> that <<PERSON:2>> joins the call.
thread-43   : Call <<PERSON:1>>.
miss        : Email <<ORGANIZATION:1>> <<PERSON:1>><<ORGANIZATION:2>> about the invoice.
```

Both tools give the same result on the first sentences, because they run the same model. On the last sentence, the model tags "John" and "e" as organizations. LLM Guard leaves out organizations by default, so it sends "John" unmasked. The `piighost` pipeline also hides organizations, so it hides every piece, under the wrong labels. That is a mislabel, not a leak. Detection quality comes from the model, so test yours on your own texts.

### Text in French

LLM Guard's Anonymize only accepts `en` and `zh`. I gave a French sentence to its default configuration and to the one above:

```python
from llm_guard.input_scanners import Anonymize
from llm_guard.input_scanners.anonymize_helpers import BERT_LARGE_NER_CONF
from llm_guard.vault import Vault

text = "Écrivez à Marie Dubois au 06 12 34 56 78, IBAN FR76 3000 6000 0112 3456 7890 189."
default = Anonymize(Vault())
bert_large = Anonymize(Vault(), recognizer_conf=BERT_LARGE_NER_CONF, language="en")
print("default    :", default.scan(text)[0])
print("bert-large :", bert_large.scan(text)[0])
```

```text
default    : Écrivez à [REDACTED_PERSON_1] au [REDACTED_PHONE_NUMBER_1], IBAN [REDACTED_IBAN_CODE_1].
bert-large : Écrivez à Marie [REDACTED_PERSON_1]ois au 06 12 34 56 78, IBAN [REDACTED_IBAN_CODE_1].
```

The default model, a DeBERTa fine-tuned on AI4Privacy, caught the three values. The `bert-large-NER` configuration cut the name and missed the phone number.

For French text in `piighost`, swap the detector. This block compares `pipeline` from the "After" block with one that uses GLiNER2, a multilingual model that finds the entity types you name, and the `fr` and `eu` catalog groups:

```python
import asyncio

from piighost.catalog import pull
from piighost.components.detector import CompositeDetector, RegexDetector
from piighost.components.detector.ner import Gliner2Detector
from piighost.pipeline import ThreadAnonymizationPipeline

french = ThreadAnonymizationPipeline(
    CompositeDetector(
        [
            Gliner2Detector(model="fastino/gliner2-multi-v1", labels=["PERSON"]),
            RegexDetector(pull("catalog:piighost/fr") | pull("catalog:piighost/eu")),
        ]
    )
)
TEXT = "Écrivez à Marie Dubois au 06 12 34 56 78, IBAN FR76 3000 6000 0112 3456 7890 189."


async def compare() -> None:
    print("bert-large :", (await pipeline.anonymize(TEXT, thread_id="fr-1")).text)
    print("gliner2    :", (await french.anonymize(TEXT, thread_id="fr-2")).text)


asyncio.run(compare())
```

The output, with GLiNER2's loading banner removed:

```text
bert-large : <<ORGANIZATION:1>>crivez <<ORGANIZATION:2>> <<ORGANIZATION:3>> <<PERSON:1>><<ORGANIZATION:4>> au 06 12 34 56 78, <<ORGANIZATION:5>>BAN FR76 <<CREDIT_CARD:1>> 7890 189.
gliner2    : Écrivez à <<PERSON:1>> au <<FR_PHONE:1>>, IBAN <<FR_IBAN:1>>.
```

GLiNER2 with the French formats hides the three values. This is one sentence, not a benchmark.

### Option by option

| LLM Guard | `piighost` |
|---|---|
| `Vault()` | conversation memory per `thread_id`, in RAM, Redis or SQL |
| `Anonymize(vault).scan(prompt)` | `await pipeline.anonymize(prompt, thread_id=...)` |
| `Deanonymize(vault).scan(prompt, output)` | `await pipeline.deanonymize(output, thread_id=...)` |
| `recognizer_conf` | a detector, such as `TransformersDetector`, `PresidioDetector` or `Gliner2Detector` |
| `regex_patterns` | catalog groups (`generic`, `us`, `eu`, `fr`) |
| `entity_types`, `threshold` | `labels` and `threshold` of the detector |
| `allowed_names`, `hidden_names` | [allow and deny lists](https://docs.piighost.dev/en/guide/examples/overrides) |
| `use_faker` | no equivalent |
| `preamble` | no equivalent |

About the two options with no equivalent:

- `use_faker`: LLM Guard swaps values for fake ones. `piighost` keeps synthetic tokens, because a fake can match a real value or another person's fake. Restoration would then return the wrong person, as the [FAQ](https://docs.piighost.dev/en/guide/community/faq) explains.
- `preamble`: LLM Guard adds a fixed text before the de-identified prompt. If you relied on it, move that text into your own prompt.

The mapping holds the real values, so it is personal data under the GDPR. The RAM store drops a thread after one idle day by default, and `forget_thread` erases a thread on request. The [deployment guide](https://docs.piighost.dev/en/guide/deployment) and the [compliance page](https://docs.piighost.dev/en/guide/compliance) cover retention and the GDPR.

## What piighost adds

LLM Guard's library leaves the isolation of conversations to you, with one in-memory `Vault` each. Its FastAPI server instead creates [a single vault at startup](https://github.com/protectai/llm-guard/blob/main/llm_guard_api/app/app.py) and shares it across every request. The flaw is in that server, not in the library. I reproduced its setup with the library:

```python
# Mirrors llm_guard_api/app/app.py: one Vault() created at startup, shared by all requests.
from llm_guard.input_scanners import Anonymize
from llm_guard.input_scanners.anonymize_helpers import BERT_LARGE_NER_CONF
from llm_guard.output_scanners import Deanonymize
from llm_guard.vault import Vault

vault = Vault()
anonymize = Anonymize(vault, recognizer_conf=BERT_LARGE_NER_CONF, language="en")
deanonymize = Deanonymize(vault)

# Request from user A
print("user A sends :", anonymize.scan("Email John Doe at john.doe@example.com about the invoice.")[0])
# Request from user B: their model output happens to contain the same placeholder
print("user B reads :", deanonymize.scan("Hi", "Hello [REDACTED_PERSON_1], how can I help?")[0])
```

```text
user A sends : Email [REDACTED_PERSON_1] at [REDACTED_EMAIL_ADDRESS_1] about the invoice.
user B reads : Hello John Doe, how can I help?
```

In `piighost`, each `thread_id` has its own mapping. This block reuses `pipeline` and restores a placeholder on the wrong thread:

```python
import asyncio


async def two_users() -> None:
    sent = await pipeline.anonymize(
        "Email John Doe at john.doe@example.com about the invoice.", thread_id="user-a"
    )
    print("user A sends :", sent.text)
    # User B's model happens to write the same placeholder.
    reply = await pipeline.deanonymize("Hello <<PERSON:1>>, how can I help?", thread_id="user-b")
    print("user B reads :", reply)


asyncio.run(two_users())
```

```text
user A sends : Email <<PERSON:1>> at <<EMAIL:1>> about the invoice.
user B reads : Hello <<PERSON:1>>, how can I help?
```

LLM Guard does not document restoration in tool-call arguments. In its [streaming example](https://github.com/protectai/llm-guard/blob/main/examples/openai_streaming.py), the model receives the original prompt, because the prompt scan runs in parallel with the model call. With the `piighost` LangChain middleware, the model only writes the placeholder and the tool receives the real value.

This block reuses `pipeline`. Its model is a scripted stand-in, swapped in by hidden lines from the docs' [test helpers](https://github.com/Athroniaeth/piighost/blob/master/docs/snippets/_offline.py). It streams four characters at a time and raises an error if a real value reaches it.

```python
import asyncio

from langchain.agents import create_agent
from langchain.tools import tool
from langchain_core.messages import AIMessage

from piighost.integrations.langchain import PIIAnonymizationMiddleware

middleware = PIIAnonymizationMiddleware(pipeline=pipeline)
PROMPT = "Send the invoice to john.doe@example.com for John Doe."


@tool
def send_invoice(to: str) -> str:
    """Send the invoice to an email address."""
    print("tool receives:", to)
    return f"Invoice sent to {to}."


agent = create_agent(
    model="openai:gpt-5.6-terra",
    tools=[send_invoice],
    middleware=[middleware],
)


async def model_text():
    async for chunk, _meta in agent.astream(
        {"messages": [{"role": "user", "content": PROMPT}]},
        {"configurable": {"thread_id": "thread-42"}},
        stream_mode="messages",
    ):
        if isinstance(chunk, AIMessage) and chunk.tool_call_chunks:
            print("LLM writes   :", chunk.tool_call_chunks[0]["args"])
        elif isinstance(chunk, AIMessage) and isinstance(chunk.content, str):
            yield chunk.content


async def main() -> None:
    async for piece in middleware.deanonymize_stream(model_text(), "thread-42"):
        print("user reads   :", repr(piece))


asyncio.run(main())
```

```text
LLM writes   : {"to": "<<EMAIL:1>>"}
tool receives: john.doe@example.com
user reads   : 'Done'
user reads   : '. '
user reads   : 'John Doe g'
user reads   : 'ets '
user reads   : 'the '
user reads   : 'invo'
user reads   : 'ice '
user reads   : 'at '
user reads   : 'john.doe@example.com.'
```

The same pipeline also plugs into Pydantic AI, LlamaIndex, Claude Code and an [OpenAI-compatible proxy](https://docs.piighost.dev/en/guide/examples/openai-proxy). The [LangChain guide](https://docs.piighost.dev/en/guide/getting-started/langchain) has the full setup.

`piighost` also has costs:

- Asynchronous API: every call takes `await`, so synchronous code wraps it in `asyncio.run`.
- One maintainer: if I stop, you are where LLM Guard users are today, with MIT code you can fork.

## What piighost does not replace

`piighost` only covers Anonymize and Deanonymize. It does not check for injection, toxicity or banned topics. For the other scanners, these replacements were available, and maintained for the projects, on 6 October 2026:

- Prompt injection: Meta's [Llama Prompt Guard 2](https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M) (gated, Llama license), [NeMo Guardrails](https://github.com/NVIDIA-NeMo/Guardrails), or Lakera Guard as a commercial API. Avoid Rebuff, another Protect AI project, which is archived too.
- Toxicity and banned topics: [Llama Guard 4](https://huggingface.co/meta-llama/Llama-Guard-4-12B) (gated, Llama license), [Detoxify](https://github.com/unitaryai/detoxify), or the `toxic_language` validator of [Guardrails AI](https://github.com/guardrails-ai/guardrails).
- Secrets: LLM Guard's scanner relied on a fork of [detect-secrets](https://github.com/Yelp/detect-secrets), which also flags random-looking strings that may be keys. The `piighost/secrets` and `piighost/secrets-extended` catalog groups are regexes only. They catch keys with a known format, such as AWS keys, and miss the others. Use detect-secrets itself, and [gitleaks](https://github.com/gitleaks/gitleaks) for repositories.

I have not looked for a replacement for the code, gibberish, relevance and reading-time checks.

## Other alternatives for personal data

The [comparison page](https://docs.piighost.dev/en/guide/comparison) covers other options besides `piighost`:

- [Presidio](https://github.com/data-privacy-stack/presidio), the engine inside Anonymize, is still active, but restores a value only by hand.
- LangChain's `PIIMiddleware` blocks, redacts, masks or hashes values in an agent, and never restores them.
- PrivAiTe is a self-hosted proxy that restores values, with a mapping that lasts one request.

If LLM Guard was only your PII layer, the migration is the "Before" and "After" blocks above. If it was your whole guard, plan one replacement per scanner.

I maintain `piighost`.
