---
title: "Is data sent to an LLM anonymous? What the EDPB says"
description: "What the EDPB's draft anonymisation guidelines 02/2026 and the CJEU's SRB ruling mean for de-identified text sent to an LLM, and what deployers document."
date: 2026-10-07
lang: en
slug: edpb-anonymisation-llm
tags: [llm, privacy, gdpr, edpb, pseudonymisation]
author: Athroniaeth
draft: false
---

> **In short.** Replacing names with placeholders before an LLM call is pseudonymisation, not anonymisation. For the deployer, and for a provider acting on its behalf, the text stays personal data. A provider that reuses inputs for itself might hold anonymous data, but only if it cannot reach the mapping table and nothing left in the text points to a person.

The European Data Protection Board (EDPB) adopted its [Guidelines 02/2026 on Anonymisation](https://www.edpb.europa.eu/public-consultations/guidelines-022026-on-anonymisation_en) on 7 July 2026, as a draft open for consultation until 30 October 2026. They answer a question that matters to every team sending text to a hosted LLM. Can the same data be personal for one party and anonymous for another?

Before a message goes to the LLM, a tool replaces each name with a placeholder, a token such as `<<PERSON:1>>`. The deployer, meaning the organisation that builds the LLM into its service, keeps a mapping table to restore the real values. When I interpret, I write "in my reading". None of this is legal advice.

## For the deployer, it is pseudonymisation

Replacing names while keeping the mapping table is pseudonymisation under [Article 4(5) GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng). The table is part of the "additional information" that attributes the data to a person (draft [Guidelines 01/2025 on Pseudonymisation](https://www.edpb.europa.eu/public-consultations/guidelines-012025-on-pseudonymisation_en), paragraph 20). Whoever keeps it "will still have to treat the given data as personal data" (Guidelines 02/2026, paragraph 37).

Controllers "should not use descriptions like 'anonymous', 'de-identified' or 'de-personalised' if individuals are actually still identifiable" (paragraph 40). A privacy notice should therefore say pseudonymisation.

## For the provider, it depends on its role

The Court of Justice ruled on 4 September 2025 in [Case C-413/23 P, EDPS v SRB](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:62023CJ0413) (European Data Protection Supervisor v Single Resolution Board). The judgment applies Regulation 2018/1725, which covers EU institutions, but its definition of personal data is "essentially identical" to the GDPR's (paragraph 52). In my reading, its reasoning carries over to the GDPR, although the case did not involve AI.

The Court held that pseudonymised data are not personal "in all cases and for every person" (paragraphs 76, 77 and 86). Two consequences follow.

- For the controller that holds the additional information, the data stay personal.
- For a recipient, they may not be, under two conditions. It must be unable to lift the pseudonymisation, and unable to identify the person "by recourse to other means of identification such as cross-checking with other factors".

Guidelines 02/2026 apply this reasoning entity by entity (paragraphs 6 and 7). In my reading, an LLM provider can both answer you and reuse your text for its own purposes, and each use is assessed apart.

| Who | Whose perspective | Is the placeholder text personal data for it? | What to do |
|---|---|---|---|
| Deployer | its own | yes | apply the GDPR in full |
| Provider acting on your behalf | the deployer's | yes | sign a processor contract (Article 28) |
| Provider reusing inputs for itself | its own | only if it can neither lift the placeholders nor identify anyone by cross-checking | object to the reuse, or document the provider as a controller |

### If it acts on your behalf

Under paragraph 15, if the information is personal for the controller, "that information should also be considered personal data for the processing entity". In my reading, this covers an LLM API used under a data processing agreement. Placeholders change what the provider sees and what leaks in an incident, not the legal status of the text.

### If it processes for its own purposes

Under Example 4, a recipient that decides alone how to use the data is assessed from its own perspective. In my reading, a provider that reuses inputs falls under this case for that reuse. Reuse depends on the provider's terms, sometimes on the plan or a setting. Check them.

For that reuse, the likelihood of identification must be "insignificant in reality" (paragraph 22). The first condition of the judgment requires the mapping table to stay out of the provider's reach. The second depends on what the text still says.

## An example with `piighost`

I maintain [`piighost`](https://github.com/Athroniaeth/piighost), a Python library that does this replacement. The script below de-identifies a message, then restores an answer written as the LLM would return it. An exact-match detector keeps the output reproducible.

```python
import asyncio

from piighost.components.detector import ExactMatchDetector
from piighost.pipeline import ThreadAnonymizationPipeline

detector = ExactMatchDetector({"Patrick Martin": "PERSON"})
pipeline = ThreadAnonymizationPipeline(detector)


async def main() -> None:
    message = (
        "Patrick Martin, the only notary in our village of 300 people, "
        "signed the town hall's deed of sale on 3 March."
    )
    sent = await pipeline.anonymize(message, thread_id="thread-42")
    print(sent.text)

    answer = await pipeline.deanonymize(
        "Reminder sent to <<PERSON:1>>.", thread_id="thread-42"
    )
    print(answer)


asyncio.run(main())
```

```text
<<PERSON:1>>, the only notary in our village of 300 people, signed the town hall's deed of sale on 3 March.
Reminder sent to Patrick Martin.
```

The name never reaches the provider. The rest of the sentence still points to one person, because he is the only notary in "our village" and the provider knows which customer is writing.

`piighost` keeps the mapping table in the application's memory by default, or in Redis or SQL. The first condition holds only if that storage and the traces stay under the deployer's control, with clear-text tracing off. Other tools, such as [Microsoft Presidio](https://github.com/microsoft/presidio), do the same replacement, with the same legal analysis. A model run on your own servers avoids the provider question.

## What can still point to the person

- **Combinations of attributes.** Attributes that together fit only one person identify that person (paragraph 24, Example 5). The only notary in the village is such a case.
- **Detector misses.** A name the detector does not recognise goes out in clear. Data that mix anonymous and personal parts are personal as a whole, unless the parts are handled separately (paragraph 36). In my reading, a stream of conversations where a few messages still identify someone falls under this rule.
- **The provider's means.** A contract that bans re-identification only complements technical measures, because it is not a legal prohibition (paragraph 34). The EDPB also advises against relying on the provider's lack of motivation (paragraph 31).

In the [`piighost` benchmark](https://docs.piighost.dev/en/guide/benchmark/) of 29 September 2026 (version 1.10.0), a value counts as hidden only when fully masked. The pipeline hid 46% or 61% of direct identifiers in English ECHR judgments, depending on the model. With GLiNER2, it hid 95% of identifiers in generated French documents, yet only 43% of those documents came out with nothing in clear. These sets are not conversations, so the figures give only an order of magnitude.

In my reading, de-identified free text is hard to call anonymous for the provider, message after message. The safe position, close to the simplified approach of paragraph 48, treats it as personal data.

## What the deployer should document

The privacy notice must give "the recipients or categories of recipients" (Article 13(1)(e)). This duty is assessed at collection, from the controller's perspective (judgment, paragraph 111, guidelines, Example 2). In my reading, that means at least the provider's category. Naming it is good practice.

The rest goes into the contract and, when the risk is likely to be high, into the data protection impact assessment (DPIA, Article 35).

- **The provider's role.** Processor (Article 28), joint controller (Article 26), or controller for a reuse. The [CNIL](https://www.cnil.fr/fr/les-questions-reponses-de-la-cnil-sur-lutilisation-dun-systeme-dia-generative), the French data protection authority, asks deployers to work out this role and, where relevant, to object to reuse (question 6).
- **The mapping table.** It is personal data to secure under Article 32. A leak re-identifies every conversation it covers and falls under the breach rules of Articles 33 and 34.
- **Flows and residual risks.** Where the table lives, who can restore, how often detectors miss. [How to document `piighost` in a DPIA](https://docs.piighost.dev/en/guide/dpia/) gives a template in the order of Article 35(7).

For personal data, the CNIL prefers an on-premise deployment, then accepts a remote host under a processor contract (question 5). For an API, it advises "avoiding as far as possible the input of personal data" (my translation). In my reading, placeholders follow that advice without waiving any obligation.

## Responding to the consultation before 30 October

The form on the [consultation page](https://www.edpb.europa.eu/public-consultations/guidelines-022026-on-anonymisation_en) closes on 30 October 2026 at 23:59 CET. Contributions are published as PDFs, so strip private metadata from yours.

Two topics seem worth raising.

- **Free text.** None of the 25 examples deals with free text sent to an AI provider. AI appears only as a source of inferences or a re-identification tool (paragraphs 82, 83, 92).
- **The dual role.** In my reading, a provider can be a processor for the answer and a controller for a reuse. Paragraph 15 does not say how the two combine, or what the contract should say.

I maintain `piighost`, the library used in the example above.
