---
title: "Bonjour, blog"
description: "Un article de test, jamais publié. Il vérifie le rendu des titres, d’une liste, d’un tableau, d’un bloc de code, d’une image et d’un lien."
date: 2026-10-06
lang: fr
slug: hello-blog
tags: [test, blog]
author: Athroniaeth
draft: true
---

Cet article sert à tester le blog. Il reste un brouillon, donc il n’apparaît pas en production.

## Ce que la page doit montrer

Chaque élément ci-dessous a un rendu prévu par la charte :

- une liste à puces, avec du `code en ligne`
- un [lien vers la documentation](https://docs.piighost.dev/fr/)
- un tableau qui devient une pile de cartes sur un téléphone
- un bloc de code coloré, avec son bouton de copie

### Un tableau

| Détecteur | Type | Restaure les valeurs | Remarque |
|---|---|:---:|---|
| `RegexDetector` | motif | oui | rapide, sans modèle |
| `Gliner2Detector` | NER | oui | un modèle local, plus lent |
| `LLMDetector` | LLM | oui | le plus souple, le plus coûteux |

### Un bloc de code

```python
from piighost.components.detector import ExactMatchDetector

detector = ExactMatchDetector({"Patrick": "PERSON"})
```

```bash
uv add piighost
```

### Une image

![Le texte passe par piighost avant d’atteindre le LLM.](assets/flux.svg)

Je maintiens piighost.
