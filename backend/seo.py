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

from litestar import Request, Response, get

from backend import PROJECT_ROOT

XML_MEDIA_TYPE = "application/xml"
TEXT_MEDIA_TYPE = "text/plain"

_ROUTES = json.loads((PROJECT_ROOT / "routes.json").read_text(encoding="utf-8"))

LOCALES: tuple[str, ...] = tuple(_ROUTES["locales"])
"""The languages the site answers in, taken from routes.json."""

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
others is exactly the drift this project spends its time preventing. Twelve
entries today, two languages times six pages.
"""

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
    # deux traductions et non deux pages concurrentes.
    lignes = []
    for page in PAGES:
        for locale in LOCALES:
            alternates = "".join(
                f'<xhtml:link rel="alternate" hreflang="{autre}" '
                f'href="{origin}{_url(page["chemin"], autre)}"/>'
                for autre in LOCALES
            )
            lignes.append(
                f"<url>"
                f"<loc>{origin}{_url(page['chemin'], locale)}</loc>"
                f"<changefreq>{page['frequence']}</changefreq>"
                f"<priority>{page['priorite']}</priority>"
                f"{alternates}"
                f"</url>"
            )
    entries = "\n".join(lignes)
    body = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        f"{entries}\n"
        "</urlset>\n"
    )
    return Response(body, media_type=XML_MEDIA_TYPE, headers={"Cache-Control": CACHE})
