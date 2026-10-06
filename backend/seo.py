"""robots.txt and sitemap.xml, served by the API at the site root.

A single page application is invisible to anything that does not run
JavaScript. Every URL returns the same empty document, so a crawler that
follows no link and executes no script learns that exactly one page exists.
The sitemap is how it learns the others, which makes these two files the
cheapest indexing work available and the first thing a template should ship.

Both are generated from the request rather than from configuration, so a
preview deployment advertises itself and not production. Declare your routes in
STATIC_PATHS; it is the one place the site's shape is written down, and the
prerenderer a growing application eventually needs reads the same list.
"""

import json
from datetime import date
from xml.sax.saxutils import escape, quoteattr

from litestar import Request, Response, get
from litestar.exceptions import NotFoundException
from litestar.params import FromPath

from backend import PROJECT_ROOT
from backend.blog import BLOG_ROOT, DRAFTS, Article, load_articles, translations

XML_MEDIA_TYPE = "application/xml"
TEXT_MEDIA_TYPE = "text/plain"
ATOM_MEDIA_TYPE = "application/atom+xml"

_ROUTES = json.loads((PROJECT_ROOT / "routes.json").read_text(encoding="utf-8"))

LOCALES: tuple[str, ...] = tuple(_ROUTES["locales"])
"""The languages the site answers in, taken from routes.json."""

DEFAULT_LOCALE: str = _ROUTES["localeParDefaut"]
"""The language `x-default` points at, the one the bare root falls back to."""

PAGES: tuple[dict, ...] = tuple(_ROUTES["pages"])
"""Every page, with its priority and change frequency."""


def _url(path: str, locale: str) -> str:
    """The address of a page in one language: `/fr/projects/api`."""
    return f"/{locale}" if path == "/" else f"/{locale}{path}"


STATIC_PATHS: tuple[str, ...] = tuple(
    _url(page["chemin"], locale) for locale in LOCALES for page in PAGES
)
"""Every page a crawler should know about, in every language.

Read from routes.json rather than written here. The same file drives the
frontend router and the prerenderer: a page declared in one place and not the
others is exactly the drift this project spends its time preventing. Fourteen
entries today, two languages times seven pages.
"""

ARTICLES: tuple[Article, ...] = load_articles(BLOG_ROOT, LOCALES, drafts=DRAFTS)
"""The published blog articles, newest first, read once at startup.

Read from the same Markdown files the frontend renders, with the same draft
rule, so the sitemap and the feeds list exactly the pages nginx serves.
"""

FEEDS: dict[str, tuple[str, str]] = {
    "fr": (
        "Le blog de piighost",
        "Des articles sur la dé-identification des données personnelles avant un LLM.",
    ),
    "en": (
        "The piighost blog",
        "Articles on de-identifying personal data before an LLM.",
    ),
}
"""Each feed's title and subtitle, in its language."""

BLOG_OPENED = date(2026, 10, 6)
"""The day the blog opened. An Atom feed must carry an `updated` date, and an
empty feed has no article to take it from."""

DISALLOWED = ("/api/", "/schema")
"""Paths worth keeping out of an index: the API and its documentation.

Not a security measure — robots.txt is a request, not a guard. It keeps a
crawler's budget on the pages that are meant to be read.
"""

AI_CRAWLERS = (
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "anthropic-ai",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Googlebot",
    "Bingbot",
    "CCBot",
)
"""Crawlers named one by one, each allowed the site and kept off the API.

The wildcard group already lets them in. They are listed anyway because a
crawler that finds a group with its own name obeys that group alone, and
because an explicit Allow is how a site says it wants to be read by answer
engines, not merely tolerated. The previous site listed the same names.
"""

CACHE = "public, max-age=3600"
"""An hour. These change when the application does, not by the minute."""


def origin_of(request: Request) -> str:
    """The public origin, honouring the proxy headers nginx sets.

    Taken from the request rather than from configuration so a preview
    deployment, a local run and production each advertise themselves and not
    each other.
    """
    url = request.url
    scheme = request.headers.get("x-forwarded-proto", url.scheme)
    host = request.headers.get("host", url.netloc)
    return f"{scheme}://{host}"


@get(
    "/robots.txt",
    name="seo:robots",
    media_type=TEXT_MEDIA_TYPE,
    include_in_schema=False,
)
async def robots(request: Request) -> Response[str]:
    """Allow the site, keep the API out, and point at the sitemap."""
    lines: list[str] = []
    for agent in (*AI_CRAWLERS, "*"):
        lines += [f"User-agent: {agent}", "Allow: /"]
        lines += [f"Disallow: {path}" for path in DISALLOWED]
        lines.append("")
    lines += [f"Sitemap: {origin_of(request)}/sitemap.xml", ""]
    return Response(
        "\n".join(lines), media_type=TEXT_MEDIA_TYPE, headers={"Cache-Control": CACHE}
    )


@get(
    "/sitemap.xml",
    name="seo:sitemap",
    media_type=XML_MEDIA_TYPE,
    include_in_schema=False,
)
async def sitemap(request: Request) -> Response[str]:
    """One entry per declared page, absolute, on the origin that was asked."""
    origin = origin_of(request)

    # Chaque page est déclarée dans les deux langues, et chacune pointe vers
    # l'autre par un lien alternate : c'est ce qui dit à un index que ce sont
    # deux traductions et non deux pages concurrentes. `x-default` vise la
    # langue par défaut, comme les balises hreflang des pages elles-mêmes : un
    # sitemap qui en annonce moins que la page envoie deux signaux différents.
    #
    # Pas de <lastmod>. La seule date juste serait celle du dernier commit des
    # fichiers de la page, et l'image n'embarque pas .git (.dockerignore).
    # La date du jour, elle, dirait à chaque passage que tout a changé, et un
    # moteur finit par ignorer un lastmod qui ment.
    lignes = []
    for page in PAGES:
        for locale in LOCALES:
            alternates = "".join(
                f'<xhtml:link rel="alternate" hreflang="{autre}" '
                f'href="{origin}{_url(page["chemin"], autre)}"/>'
                for autre in LOCALES
            ) + (
                f'<xhtml:link rel="alternate" hreflang="x-default" '
                f'href="{origin}{_url(page["chemin"], DEFAULT_LOCALE)}"/>'
            )
            lignes.append(
                f"<url>"
                f"<loc>{origin}{_url(page['chemin'], locale)}</loc>"
                f"<changefreq>{page['frequence']}</changefreq>"
                f"<priority>{page['priorite']}</priority>"
                f"{alternates}"
                f"</url>"
            )
    lignes += [_article_entry(origin, article) for article in ARTICLES]
    entries = "\n".join(lignes)
    body = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        f"{entries}\n"
        "</urlset>\n"
    )
    return Response(body, media_type=XML_MEDIA_TYPE, headers={"Cache-Control": CACHE})


def _article_entry(origin: str, article: Article) -> str:
    """One article in the sitemap.

    Its `lastmod` is the date written in its front matter, the one date that
    is true here. The language alternates are declared only when the article
    is published in every language, because an alternate that leads to a 404
    is worse than none. The page itself announces none in that case either.
    """
    versions = translations(ARTICLES, article.slug)
    alternates = ""
    if all(locale in versions for locale in LOCALES):
        alternates = "".join(
            f'<xhtml:link rel="alternate" hreflang="{locale}" '
            f'href="{origin}{versions[locale].path}"/>'
            for locale in LOCALES
        ) + (
            f'<xhtml:link rel="alternate" hreflang="x-default" '
            f'href="{origin}{versions[DEFAULT_LOCALE].path}"/>'
        )
    return (
        f"<url>"
        f"<loc>{origin}{article.path}</loc>"
        f"<lastmod>{article.updated.isoformat()}</lastmod>"
        f"<changefreq>monthly</changefreq>"
        f"<priority>0.7</priority>"
        f"{alternates}"
        f"</url>"
    )


def _timestamp(day: date) -> str:
    """An Atom date, in RFC 3339, at midnight UTC."""
    return f"{day.isoformat()}T00:00:00Z"


@get(
    "/{lang:str}/blog/feed.xml",
    name="seo:feed",
    media_type=ATOM_MEDIA_TYPE,
    include_in_schema=False,
)
async def feed(request: Request, lang: FromPath[str]) -> Response[str]:
    """The blog's Atom feed in one language, newest article first.

    Each entry carries the article's description as its summary, not its
    body. The body is rendered by the frontend, and a reader follows the link
    to the page. Like the sitemap, the addresses follow the origin that was
    asked, so a preview deployment advertises itself.
    """
    if lang not in LOCALES:
        raise NotFoundException()
    origin = origin_of(request)
    title, subtitle = FEEDS[lang]
    articles = [a for a in ARTICLES if a.lang == lang]
    updated = max((a.updated for a in articles), default=BLOG_OPENED)
    blog = f"{origin}/{lang}/blog"

    entries = []
    for article in articles:
        url = f"{origin}{article.path}"
        categories = "".join(
            f"<category term={quoteattr(tag)}/>" for tag in article.tags
        )
        entries.append(
            "<entry>"
            f"<title>{escape(article.title)}</title>"
            f'<link rel="alternate" type="text/html" href={quoteattr(url)}/>'
            f"<id>{escape(url)}</id>"
            f"<published>{_timestamp(article.published)}</published>"
            f"<updated>{_timestamp(article.updated)}</updated>"
            f"<author><name>{escape(article.author)}</name></author>"
            f"<summary>{escape(article.description)}</summary>"
            f"{categories}"
            "</entry>"
        )

    body = (
        '<?xml version="1.0" encoding="utf-8"?>\n'
        f'<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="{lang}">\n'
        f"<title>{escape(title)}</title>\n"
        f"<subtitle>{escape(subtitle)}</subtitle>\n"
        f'<link rel="self" type="{ATOM_MEDIA_TYPE}" href="{blog}/feed.xml"/>\n'
        f'<link rel="alternate" type="text/html" href="{blog}"/>\n'
        f"<id>{blog}</id>\n"
        f"<updated>{_timestamp(updated)}</updated>\n"
        + "".join(f"{entry}\n" for entry in entries)
        + "</feed>\n"
    )
    return Response(body, media_type=ATOM_MEDIA_TYPE, headers={"Cache-Control": CACHE})
