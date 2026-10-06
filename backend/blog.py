"""The blog's articles, as the sitemap and the feeds need them.

The articles are the Markdown files the frontend renders at build time, under
``frontend/src/content/blog/{lang}/<slug>.md``. Only their YAML front matter is
read here: the title, the description, the dates and the tags. The body stays
the frontend's business.

The frontend applies the same rules in ``frontend/blog/build.ts``. A draft
(``draft: true``) is left out unless ``BLOG_DRAFTS=1``, so a draft is absent
from the pages, the sitemap and the feeds at once.
"""

import os
import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path

import yaml

from backend import FRONTEND_ROOT

BLOG_ROOT = FRONTEND_ROOT / "src" / "content" / "blog"
"""Where the articles live. The API image copies this folder (Dockerfile.api)."""

DRAFTS = os.getenv("BLOG_DRAFTS") == "1"
"""Whether drafts are published, as the frontend build reads the same variable."""

_FRONT_MATTER = re.compile(r"\A---\r?\n(.*?)\r?\n---\r?\n", re.DOTALL)


@dataclass(frozen=True, slots=True)
class Article:
    """One article in one language."""

    slug: str
    lang: str
    title: str
    description: str
    published: date
    updated: date
    tags: tuple[str, ...]
    author: str
    draft: bool

    @property
    def path(self) -> str:
        """The article's address on the site: ``/fr/blog/<slug>``."""
        return f"/{self.lang}/blog/{self.slug}"


def _date(value: object, path: Path) -> date:
    """A front matter date, whether YAML parsed it or left it a string."""
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        return date.fromisoformat(value)
    raise ValueError(f"{path}: a date must be written YYYY-MM-DD")


def read_article(path: Path) -> Article:
    """Read one article's front matter.

    The folder gives the language and the file name the slug. The front matter
    must say the same, so a file copied from one language to the other without
    updating its header is caught here, as the frontend build catches it.
    """
    match = _FRONT_MATTER.match(path.read_text(encoding="utf-8"))
    if not match:
        raise ValueError(f"{path}: missing YAML front matter")
    meta = yaml.safe_load(match.group(1)) or {}
    lang, slug = path.parent.name, path.stem
    if meta.get("lang") != lang or meta.get("slug") != slug:
        raise ValueError(f"{path}: lang and slug must match the folder and file name")
    published = _date(meta.get("date"), path)
    return Article(
        slug=slug,
        lang=lang,
        title=str(meta["title"]).strip(),
        description=str(meta["description"]).strip(),
        published=published,
        updated=_date(meta["updated"], path) if "updated" in meta else published,
        tags=tuple(str(tag).strip() for tag in meta.get("tags") or ()),
        author=str(meta["author"]).strip(),
        draft=meta.get("draft") is True,
    )


def load_articles(
    root: Path, locales: tuple[str, ...], *, drafts: bool
) -> tuple[Article, ...]:
    """Every published article, newest first."""
    articles = [
        read_article(path)
        for locale in locales
        for path in sorted((root / locale).glob("*.md"))
    ]
    published = [a for a in articles if drafts or not a.draft]
    return tuple(sorted(published, key=lambda a: (-a.published.toordinal(), a.slug)))


def translations(articles: tuple[Article, ...], slug: str) -> dict[str, Article]:
    """The published versions of one article, by language."""
    return {a.lang: a for a in articles if a.slug == slug}
