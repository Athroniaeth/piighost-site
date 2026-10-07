---
title: "Les données envoyées à un LLM sont-elles anonymes ? Ce que dit le CEPD"
description: "Ce que le projet de lignes directrices 02/2026 du CEPD et l’arrêt C-413/23 P disent d’un texte dé-identifié envoyé à un LLM, et ce qu’il faut documenter."
date: 2026-10-07
lang: fr
slug: edpb-anonymisation-llm
tags: [llm, privacy, gdpr, edpb, pseudonymisation]
author: Athroniaeth
draft: false
---

> **En bref.** Remplacer les noms par des placeholders avant un appel au LLM est une pseudonymisation, pas une anonymisation. Pour le déployeur, et pour un fournisseur qui agit pour son compte, le texte reste une donnée personnelle. Un fournisseur qui réutilise les entrées pour lui-même pourrait détenir des données anonymes, mais seulement s’il ne peut pas atteindre la table de correspondance et si rien dans le texte ne désigne encore une personne.

Le Comité européen de la protection des données (CEPD, EDPB en anglais) a adopté le 7 juillet 2026 ses [lignes directrices 02/2026 sur l’anonymisation](https://www.edpb.europa.eu/public-consultations/guidelines-022026-on-anonymisation_fr), un projet soumis à consultation jusqu’au 30 octobre 2026. Elles répondent à une question qui touche toute équipe envoyant du texte à un LLM hébergé. Une même donnée peut-elle être personnelle pour l’un et anonyme pour l’autre ?

Avant qu’un message parte au LLM, un outil remplace chaque nom par un placeholder, un jeton comme `<<PERSON:1>>`. Le déployeur, c’est-à-dire l’organisation qui intègre le LLM à son service, garde une table de correspondance pour retrouver les vraies valeurs. J’écris « à ma lecture » quand j’interprète, et ce n’est pas un conseil juridique. Les lignes directrices n’existent qu’en anglais, je les traduis librement.

## Pour le déployeur, c’est une pseudonymisation

Remplacer les noms en gardant la table de correspondance est une pseudonymisation au sens de l’[article 4, point 5)](https://eur-lex.europa.eu/eli/reg/2016/679/oj/fra) du RGPD. La table fait partie des « informations supplémentaires » qui rattachent les données à une personne ([lignes directrices 01/2025 sur la pseudonymisation](https://www.edpb.europa.eu/public-consultations/guidelines-012025-on-pseudonymisation_fr), encore en projet, paragraphe 20). Qui la garde doit encore traiter les données comme personnelles (lignes directrices 02/2026, paragraphe 37).

Un responsable ne devrait pas dire « anonymes », « dé-identifiées » ou « dépersonnalisées » si les personnes restent identifiables (paragraphe 40). Une mention d’information doit donc dire pseudonymisation.

## Pour le fournisseur, tout dépend de son rôle

La Cour de justice a statué le 4 septembre 2025 dans l’[arrêt C-413/23 P](https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:62023CJ0413), sur le pourvoi du Contrôleur européen de la protection des données contre le Conseil de résolution unique (CRU). L’arrêt applique le règlement 2018/1725, propre aux institutions de l’Union, mais sa définition des données personnelles est « en substance identique » à celle du RGPD (point 52). À ma lecture, son raisonnement vaut donc pour le RGPD, même si l’affaire ne portait pas sur l’IA.

La Cour a jugé que des données pseudonymisées ne sont pas personnelles « en toute hypothèse et pour toute personne » (points 76, 77 et 86). Deux conséquences en découlent.

- Pour le responsable qui détient les informations supplémentaires, les données restent personnelles.
- Pour un destinataire, elles peuvent ne pas l’être, à deux conditions. Il ne doit pouvoir ni lever la pseudonymisation, ni identifier la personne « par le recours à d’autres moyens d’identification tels qu’un recoupement avec d’autres éléments ».

Les lignes directrices 02/2026 appliquent ce raisonnement entité par entité (paragraphes 6 et 7). À ma lecture, un fournisseur de LLM peut à la fois vous répondre et réutiliser votre texte pour ses propres finalités, et chaque usage s’apprécie à part.

| Qui | Point de vue retenu | Le texte à placeholders est-il personnel pour lui ? | Que faire |
|---|---|---|---|
| Déployeur | le sien | oui | appliquer tout le RGPD |
| Fournisseur qui agit pour votre compte | celui du déployeur | oui | signer un contrat de sous-traitance (article 28) |
| Fournisseur qui réutilise les entrées pour lui-même | le sien | seulement s’il ne peut ni lever les placeholders ni identifier quelqu’un par recoupement | s’opposer à la réutilisation, ou documenter le fournisseur comme responsable |

### S’il agit pour votre compte

Selon le paragraphe 15, si l’information est personnelle pour le responsable, elle « devrait aussi être considérée comme une donnée personnelle pour l’entité qui la traite ». À ma lecture, c’est le cas d’une API de LLM sous contrat de sous-traitance. Les placeholders changent ce que voit le fournisseur et ce qui fuit en cas d’incident, pas la qualification du texte.

### S’il traite pour ses propres finalités

Selon l’exemple 4, un destinataire qui décide seul de l’usage des données s’apprécie de son propre point de vue. À ma lecture, un fournisseur qui réutilise les entrées relève de ce cas pour cette réutilisation. La réutilisation dépend des conditions du fournisseur, parfois de l’offre ou d’un réglage. Vérifiez-les.

Pour cette réutilisation, la probabilité d’identification doit être « insignifiante en réalité » (paragraphe 22). La première condition de l’arrêt suppose que la table de correspondance reste hors de portée du fournisseur. La seconde dépend de ce que le texte dit encore.

## Un exemple avec `piighost`

Je maintiens [`piighost`](https://github.com/Athroniaeth/piighost), une librairie Python qui fait ce remplacement. Le script suivant dé-identifie un message, puis restaure une réponse écrite comme le LLM la renverrait. Un détecteur à correspondance exacte rend la sortie reproductible.

```python
import asyncio

from piighost.components.detector import ExactMatchDetector
from piighost.pipeline import ThreadAnonymizationPipeline

detector = ExactMatchDetector({"Patrick Martin": "PERSON"})
pipeline = ThreadAnonymizationPipeline(detector)


async def main() -> None:
    message = (
        "Patrick Martin, le seul notaire de notre village de 300 habitants, "
        "a signé l'acte de vente de la mairie le 3 mars."
    )
    sent = await pipeline.anonymize(message, thread_id="thread-42")
    print(sent.text)

    answer = await pipeline.deanonymize(
        "Rappel envoyé à <<PERSON:1>>.", thread_id="thread-42"
    )
    print(answer)


asyncio.run(main())
```

```text
<<PERSON:1>>, le seul notaire de notre village de 300 habitants, a signé l'acte de vente de la mairie le 3 mars.
Rappel envoyé à Patrick Martin.
```

Le nom ne part pas chez le fournisseur. Le reste de la phrase désigne pourtant une seule personne, parce qu’il est le seul notaire de « notre village » et que le fournisseur sait quel client écrit.

`piighost` garde la table en mémoire dans l’application par défaut, ou dans Redis ou SQL. La première condition n’est remplie que si ce stockage et les traces restent sous le contrôle du déployeur, avec le traçage en clair désactivé. D’autres outils, comme [Microsoft Presidio](https://github.com/microsoft/presidio), font le même remplacement, avec la même analyse juridique. Un modèle exécuté sur vos serveurs évite la question du fournisseur.

## Ce qui peut encore désigner la personne

- **Les combinaisons d’attributs.** Des attributs qui, réunis, ne valent que pour une personne l’identifient (paragraphe 24, exemple 5). Le seul notaire du village en est un exemple.
- **Les oublis du détecteur.** Un nom que le détecteur ne reconnaît pas part en clair. Un ensemble qui mêle données anonymes et personnelles est personnel en entier, sauf traitement séparé des parties (paragraphe 36). À ma lecture, un flux de conversations dont quelques messages identifient encore quelqu’un relève de cette règle.
- **Les moyens du fournisseur.** Un contrat qui interdit la ré-identification ne fait que compléter les mesures techniques, parce que ce n’est pas une interdiction légale (paragraphe 34). Le CEPD déconseille aussi de compter sur le manque de motivation du fournisseur (paragraphe 31).

Dans le [banc d’essai de `piighost`](https://docs.piighost.dev/fr/guide/benchmark/) du 29 septembre 2026 (version 1.10.0), une valeur ne compte comme cachée qu’entièrement masquée. Le pipeline a caché 46 % ou 61 % des identifiants directs d’arrêts de la CEDH en anglais, selon le modèle. Avec GLiNER2, il a caché 95 % des identifiants d’actes et contrats français générés, mais seuls 43 % de ces documents sont sortis sans rien en clair. Ces jeux ne sont pas des conversations, donc ces chiffres ne donnent qu’un ordre de grandeur.

À ma lecture, il est difficile de soutenir que du texte libre dé-identifié est anonyme pour le fournisseur, message après message. La position prudente, proche de l’approche simplifiée du paragraphe 48, le traite comme une donnée personnelle.

## Ce que le déployeur doit documenter

La mention d’information doit donner « les destinataires ou les catégories de destinataires » (article 13, paragraphe 1, point e)). Cette obligation s’apprécie à la collecte, du point de vue du responsable (arrêt, point 111, lignes directrices, exemple 2). À ma lecture, il faut donc citer au moins la catégorie du fournisseur. Le nommer est une bonne pratique.

Le reste se documente dans le contrat et, si le risque est probablement élevé, dans l’analyse d’impact relative à la protection des données (AIPD, article 35).

- **Le rôle du fournisseur.** Sous-traitant (article 28), responsable conjoint (article 26), ou responsable pour une réutilisation. La [CNIL](https://www.cnil.fr/fr/les-questions-reponses-de-la-cnil-sur-lutilisation-dun-systeme-dia-generative) demande de s’interroger sur ce rôle et, le cas échéant, de s’opposer à la réutilisation (question 6).
- **La table de correspondance.** C’est une donnée personnelle à sécuriser selon l’article 32. Sa fuite ré-identifie toutes les conversations qu’elle couvre et relève des articles 33 et 34 sur les violations de données.
- **Les flux et les risques résiduels.** Où vit la table, qui peut restaurer, à quelle fréquence les détecteurs ratent. [Comment documenter `piighost` dans une AIPD](https://docs.piighost.dev/fr/guide/dpia/) donne un modèle dans l’ordre de l’article 35, paragraphe 7.

Pour des données personnelles, la CNIL privilégie un déploiement sur site, puis admet un hébergement distant sous contrat de sous-traitance (question 5). Avec une API, elle conseille d’éviter « autant que possible la saisie de données personnelles ». À ma lecture, les placeholders suivent ce conseil sans dispenser d’aucune obligation.

## Répondre à la consultation avant le 30 octobre

Le formulaire de la [page de la consultation](https://www.edpb.europa.eu/public-consultations/guidelines-022026-on-anonymisation_fr) ferme le 30 octobre 2026 à 23 h 59, heure d’Europe centrale. Les contributions sont publiées en PDF, retirez-en les métadonnées privées.

Deux sujets me semblent utiles à soulever.

- **Le texte libre.** Aucun des 25 exemples ne porte sur du texte libre envoyé à un fournisseur d’IA. L’IA n’y figure que comme source d’inférences ou outil de ré-identification (paragraphes 82, 83, 92).
- **Le double rôle.** À ma lecture, un fournisseur peut être sous-traitant pour la réponse et responsable pour une réutilisation. Le paragraphe 15 ne dit pas comment combiner les deux, ni ce que le contrat doit prévoir.

Je maintiens `piighost`, la librairie de l’exemple ci-dessus.
