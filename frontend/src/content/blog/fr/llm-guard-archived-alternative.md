---
title: "LLM Guard est archivé : voici une autre alternative open source pour protéger les données personnelles"
description: "LLM Guard est archivé depuis juillet 2026. Migrez Anonymize et Deanonymize vers piighost, et remplacez ses autres scanners par des outils maintenus."
date: 2026-10-07
lang: fr
slug: llm-guard-archived-alternative
tags: [llm, privacy, pii, llm-guard, migration]
author: Athroniaeth
draft: false
---

[LLM Guard](https://github.com/protectai/llm-guard) a été archivé le 9 juillet 2026. Son README s’ouvre désormais sur un avertissement. « This project and its associated models on Hugging Face are no longer under active development or maintained. » Le projet et ses modèles sur Hugging Face ne sont plus maintenus. Si vos prompts passent par son scanner Anonymize, ce code ne recevra plus de correctif.

Je maintiens `piighost`, une librairie open source qui fait une partie de ce que faisait LLM Guard. Elle dé-identifie les données personnelles avant que le prompt n’atteigne le modèle, c’est-à-dire qu’elle remplace chaque valeur par un placeholder, le token qui prend sa place. Elle restaure ensuite les vraies valeurs dans la réponse. `piighost` est sous licence MIT, sa première version sur PyPI date du 23 mars 2026, et j’en suis le seul mainteneur. Cet article montre comment migrer cette partie, et quoi utiliser pour le reste de LLM Guard.

## Ce qu’était LLM Guard

LLM Guard est une boîte à outils Python de Protect AI. Elle fait passer des scanners sur le prompt avant l’appel au modèle, et sur la réponse après, 15 en entrée et 21 en sortie. [pypistats](https://pypistats.org/packages/llm-guard) compte encore 106 172 téléchargements sur le dernier mois.

Deux scanners traitent les données personnelles :

- [Anonymize](https://protectai.github.io/llm-guard/input_scanners/anonymize/) détecte les valeurs avec Presidio, un modèle NER de transformers et des regex. Le NER (reconnaissance d’entités nommées) classe les mots d’un texte en personne, lieu ou organisation. Chaque valeur devient un placeholder comme `[REDACTED_PERSON_1]`.
- [Deanonymize](https://protectai.github.io/llm-guard/output_scanners/deanonymize/) remet les vraies valeurs dans la réponse du modèle.

Les deux partagent un `Vault`, une liste Python de paires placeholder et valeur gardée en mémoire ([code source](https://github.com/protectai/llm-guard/blob/main/llm_guard/vault.py)).

## Ce que l’archivage change

Un dépôt archivé est en lecture seule, donc personne ne peut y fusionner un correctif. La dernière version sur PyPI est la 0.3.16, du 19 mai 2025. Quatre correctifs ultérieurs de la branche principale n’ont jamais été publiés ([#271](https://github.com/protectai/llm-guard/pull/271), [#268](https://github.com/protectai/llm-guard/pull/268), [#272](https://github.com/protectai/llm-guard/pull/272), [#283](https://github.com/protectai/llm-guard/pull/283)). L’un d’eux donne le même placeholder aux valeurs identiques.

La version 0.3.16 fige `presidio-anonymizer==2.2.358`, qui fige `cryptography<44.1`. La [CVE-2026-26007](https://github.com/advisories/GHSA-r6ph-v2qm-q3c2), une faille de gravité élevée dans cryptography, est corrigée dans la version 46.0.5. L’[issue #342](https://github.com/protectai/llm-guard/issues/342) demandait en mai 2026 d’assouplir cette contrainte, et reste ouverte. Le résolveur confirme ce conflit, dans un environnement virtuel Python 3.12 :

```text
$ uv pip install --dry-run "llm-guard==0.3.16" "cryptography>=46.0.5"
error: No solution found when resolving dependencies
  cause: Because presidio-anonymizer==2.2.358 depends on cryptography<44.1 and llm-guard>=0.3.16 depends on presidio-anonymizer==2.2.358, we can conclude that llm-guard>=0.3.16 depends on cryptography<44.1.
         And because you require llm-guard==0.3.16 and cryptography>=46.0.5, we can conclude that your requirements are unsatisfiable.
```

Python 3.13 est bloqué aussi. La version 0.3.16 déclare `Requires-Python >=3.10,<3.13`, et les versions plus anciennes sur lesquelles pip se rabat échouent à la compilation. J’ai donc lancé le code LLM Guard ci-dessous sous Python 3.12.

Palo Alto Networks a [racheté](https://www.paloaltonetworks.com/company/press/2025/palo-alto-networks-completes-acquisition-of-protect-ai) Protect AI en juillet 2025. Il a intégré la technologie à Prisma AIRS, sa plateforme commerciale de sécurité de l’IA. Aucun fork n’a pris le relais. Le fork le plus étoilé mis à jour depuis l’archivage avait 2 étoiles le 6 octobre 2026.

## Anonymize et Deanonymize, côte à côte

### Avant, avec LLM Guard

Ce code suit la documentation de LLM Guard. `fake_llm` tient le rôle du modèle.

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

La sortie, sans les lignes de journal de LLM Guard :

```text
sent to LLM : Email [REDACTED_PERSON_1] at [REDACTED_EMAIL_ADDRESS_1] about the invoice.
user reads  : Done. I wrote to John Doe at john.doe@example.com.
vault       : [('[REDACTED_EMAIL_ADDRESS_1]', 'john.doe@example.com'), ('[REDACTED_PERSON_1]', 'John Doe')]
turn 2      : Also tell [REDACTED_PERSON_1] that [REDACTED_PERSON_2] joins the call.
miss        : Email John [REDACTED_PERSON_1]e about the invoice.
```

### Après, avec piighost

La version `piighost` garde le même modèle NER, `dslim/bert-large-NER`. Elle ajoute le groupe `generic` du [catalogue](https://catalog.piighost.dev), la collection de motifs regex que `piighost` charge par groupe. Un pipeline conversationnel remplace le vault. Il garde une correspondance par conversation, identifiée par un `thread_id`.

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

La sortie, avec `piighost` 2.0.1 sous Python 3.13 :

```text
sent to LLM : Email <<PERSON:1>> at <<EMAIL:1>> about the invoice.
user reads  : Done. I wrote to John Doe at john.doe@example.com.
turn 2      : Also tell <<PERSON:1>> that <<PERSON:2>> joins the call.
thread-43   : Call <<PERSON:1>>.
miss        : Email <<ORGANIZATION:1>> <<PERSON:1>><<ORGANIZATION:2>> about the invoice.
```

Les deux outils donnent le même résultat sur les premières phrases, parce qu’ils font tourner le même modèle. Sur la dernière phrase, le modèle classe « John » et « e » comme des organisations. LLM Guard exclut les organisations par défaut, donc il envoie « John » en clair. Le pipeline `piighost` masque aussi les organisations, donc il cache chaque morceau, sous de mauvais labels. C’est une erreur d’étiquette, pas une fuite. La qualité de détection vient du modèle, donc testez le vôtre sur vos textes.

### Texte en français

Anonymize n’accepte que `en` et `zh`. J’ai donné une phrase en français à sa configuration par défaut et à celle du bloc « Avant » :

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

Le modèle par défaut, un DeBERTa affiné sur AI4Privacy, a trouvé les trois valeurs. La configuration `bert-large-NER` a coupé le nom et manqué le téléphone.

Pour du texte en français dans `piighost`, changez de détecteur. Ce bloc compare `pipeline` du bloc « Après » à un pipeline qui utilise GLiNER2, un modèle multilingue qui trouve les types d’entités que vous nommez, et les groupes `fr` et `eu` du catalogue :

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

La sortie, sans la bannière de chargement de GLiNER2 :

```text
bert-large : <<ORGANIZATION:1>>crivez <<ORGANIZATION:2>> <<ORGANIZATION:3>> <<PERSON:1>><<ORGANIZATION:4>> au 06 12 34 56 78, <<ORGANIZATION:5>>BAN FR76 <<CREDIT_CARD:1>> 7890 189.
gliner2    : Écrivez à <<PERSON:1>> au <<FR_PHONE:1>>, IBAN <<FR_IBAN:1>>.
```

GLiNER2 avec les formats français cache les trois valeurs. C’est une seule phrase, pas un banc d’essai.

### Option par option

| LLM Guard | `piighost` |
|---|---|
| `Vault()` | mémoire de conversation par `thread_id`, en RAM, Redis ou SQL |
| `Anonymize(vault).scan(prompt)` | `await pipeline.anonymize(prompt, thread_id=...)` |
| `Deanonymize(vault).scan(prompt, output)` | `await pipeline.deanonymize(output, thread_id=...)` |
| `recognizer_conf` | un détecteur, comme `TransformersDetector`, `PresidioDetector` ou `Gliner2Detector` |
| `regex_patterns` | groupes du catalogue (`generic`, `us`, `eu`, `fr`) |
| `entity_types`, `threshold` | `labels` et `threshold` du détecteur |
| `allowed_names`, `hidden_names` | [listes d’autorisation et de refus](https://docs.piighost.dev/fr/guide/examples/overrides) |
| `use_faker` | pas d’équivalent |
| `preamble` | pas d’équivalent |

À propos des deux options sans équivalent :

- `use_faker` : LLM Guard remplace les valeurs par de fausses valeurs. `piighost` garde des tokens synthétiques, parce qu’une fausse valeur peut tomber sur une vraie, ou sur la fausse valeur d’une autre personne. La restauration rendrait alors la mauvaise personne, comme l’explique la [FAQ](https://docs.piighost.dev/fr/guide/community/faq).
- `preamble` : LLM Guard ajoute un texte fixe avant le prompt dé-identifié. Si vous vous en serviez, déplacez ce texte dans votre prompt.

La correspondance contient les vraies valeurs, donc des données personnelles au sens du RGPD. La mémoire en RAM oublie un thread après un jour d’inactivité par défaut, et `forget_thread` efface un thread à la demande. Le [guide de déploiement](https://docs.piighost.dev/fr/guide/deployment) et la [page conformité](https://docs.piighost.dev/fr/guide/compliance) traitent de la durée de conservation et du RGPD.

## Ce que piighost ajoute

La librairie LLM Guard vous laisse isoler les conversations, avec un `Vault` en mémoire pour chacune. Son serveur FastAPI, lui, crée [un seul vault au démarrage](https://github.com/protectai/llm-guard/blob/main/llm_guard_api/app/app.py) et le partage entre toutes les requêtes. Le défaut vient de ce serveur, pas de la librairie. J’ai reproduit son montage avec la librairie :

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

Dans `piighost`, chaque `thread_id` a sa propre correspondance. Ce bloc reprend `pipeline` et restaure un placeholder sur le mauvais thread :

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

LLM Guard ne documente pas la restauration dans les arguments d’un appel d’outil. Dans son [exemple de streaming](https://github.com/protectai/llm-guard/blob/main/examples/openai_streaming.py), le modèle reçoit le prompt d’origine, parce que l’analyse du prompt tourne en parallèle de l’appel au modèle. Avec le middleware LangChain de `piighost`, le modèle n’écrit que le placeholder, et l’outil reçoit la vraie valeur.

Ce bloc reprend `pipeline`. Son modèle est un remplaçant scripté, branché par des lignes cachées issues des [outils de test](https://github.com/Athroniaeth/piighost/blob/master/docs/snippets/_offline.py) de la documentation. Il diffuse quatre caractères à la fois, et lève une erreur si une vraie valeur l’atteint.

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

Le même pipeline se branche aussi sur Pydantic AI, LlamaIndex, Claude Code et un [proxy compatible OpenAI](https://docs.piighost.dev/fr/guide/examples/openai-proxy). Le [guide LangChain](https://docs.piighost.dev/fr/guide/getting-started/langchain) détaille l’installation complète.

`piighost` a aussi des coûts :

- API asynchrone : chaque appel prend un `await`, donc un code synchrone l’enveloppe dans `asyncio.run`.
- Un seul mainteneur : si j’arrête, vous serez dans la situation des utilisateurs de LLM Guard aujourd’hui, avec un code MIT à forker.

## Ce que piighost ne remplace pas

`piighost` ne couvre qu’Anonymize et Deanonymize. Il ne cherche ni injection, ni toxicité, ni sujet interdit. Pour les autres scanners, ces remplaçants étaient disponibles, et maintenus pour les projets, le 6 octobre 2026 :

- Injection de prompt : [Llama Prompt Guard 2](https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-86M) de Meta (accès sur demande, licence Llama), [NeMo Guardrails](https://github.com/NVIDIA-NeMo/Guardrails), ou Lakera Guard en API commerciale. Évitez Rebuff, un autre projet de Protect AI, archivé lui aussi.
- Toxicité et sujets interdits : [Llama Guard 4](https://huggingface.co/meta-llama/Llama-Guard-4-12B) (accès sur demande, licence Llama), [Detoxify](https://github.com/unitaryai/detoxify), ou le validateur `toxic_language` de [Guardrails AI](https://github.com/guardrails-ai/guardrails).
- Secrets : le scanner de LLM Guard reposait sur un fork de [detect-secrets](https://github.com/Yelp/detect-secrets), qui signale aussi les chaînes d’apparence aléatoire qui peuvent être des clés. Les groupes `piighost/secrets` et `piighost/secrets-extended` du catalogue ne sont que des regex. Ils trouvent les clés au format connu, comme les clés AWS, et manquent les autres. Utilisez detect-secrets lui-même, et [gitleaks](https://github.com/gitleaks/gitleaks) pour les dépôts.

Je n’ai pas cherché de remplaçant pour les contrôles de code, de charabia, de pertinence et de temps de lecture.

## Les autres alternatives pour les données personnelles

La [page de comparaison](https://docs.piighost.dev/fr/guide/comparison) détaille d’autres options que `piighost` :

- [Presidio](https://github.com/data-privacy-stack/presidio), le moteur à l’intérieur d’Anonymize, est toujours actif, mais ne restaure une valeur qu’à la main.
- Le `PIIMiddleware` de LangChain bloque, caviarde, masque ou hache les valeurs dans un agent, et ne les restaure jamais.
- PrivAiTe est un proxy auto-hébergé qui restaure les valeurs, avec une correspondance qui dure le temps d’une requête.

Si LLM Guard n’était que votre couche de données personnelles, la migration tient dans les blocs « Avant » et « Après » ci-dessus. S’il était toute votre protection, prévoyez un remplaçant par scanner.

Je maintiens `piighost`.
