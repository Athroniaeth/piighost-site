---
title: "Hello, blog"
description: "A test article, never published. It checks how the blog renders headings, a list, a table, a highlighted code block, an image and a link."
date: 2026-10-06
lang: en
slug: hello-blog
tags: [test, blog]
author: Athroniaeth
draft: true
---

This article tests the blog. It stays a draft, so it does not appear in production.

## What the page must show

Each element below has a rendering defined by the charter:

- a bulleted list, with some `inline code`
- a [link to the documentation](https://docs.piighost.dev/en/)
- a table that becomes a stack of cards on a phone
- a highlighted code block, with its copy button

### A table

| Detector | Type | Restores values | Note |
|---|---|:---:|---|
| `RegexDetector` | pattern | yes | fast, no model |
| `Gliner2Detector` | NER | yes | a local model, slower |
| `LLMDetector` | LLM | yes | the most flexible, the most expensive |

### A code block

```python
from piighost.components.detector import ExactMatchDetector

detector = ExactMatchDetector({"Patrick": "PERSON"})
```

```bash
uv add piighost
```

### An image

![The text goes through piighost before it reaches the LLM.](assets/flux.svg)

I maintain piighost.
