"""Tests for the blog: reading the articles, the sitemap entries, the feeds."""

from datetime import date
from pathlib import Path
from xml.etree import ElementTree

import pytest
from litestar import Litestar
from litestar.testing import AsyncTestClient

from backend import seo
from backend.blog import BLOG_ROOT, DRAFTS, load_articles, read_article
from backend.seo import LOCALES

ATOM = "{http://www.w3.org/2005/Atom}"


def write(root: Path, folder: str, name: str, **fields: object) -> Path:
    """Write one article with valid front matter, overridden by `fields`."""
    meta: dict[str, object] = {
        "title": f"Title {name} {folder}",
        "description": f"What {name} teaches & why.",
        "date": "2026-10-07",
        "lang": folder,
        "slug": name,
        "tags": ["llm", "privacy"],
        "author": "Athroniaeth",
        "draft": False,
    } | fields
    lines = [
        f"{key}: {str(value).lower() if isinstance(value, bool) else value}"
        for key, value in meta.items()
        if key != "tags"
    ]
    lines.append(f"tags: [{', '.join(meta['tags'])}]")  # type: ignore[arg-type]
    path = root / folder / f"{name}.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("---\n" + "\n".join(lines) + "\n---\n\n## Body\n", encoding="utf-8")
    return path


@pytest.fixture
def blog(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Three articles: one in both languages, one in French only, one draft."""
    write(tmp_path, "fr", "both", date="2026-10-07", updated="2026-10-09")
    write(tmp_path, "en", "both", date="2026-10-07", updated="2026-10-09")
    write(tmp_path, "fr", "french-only", date="2026-10-08")
    write(tmp_path, "fr", "secret", draft=True)
    write(tmp_path, "en", "secret", draft=True)
    monkeypatch.setattr(seo, "ARTICLES", load_articles(tmp_path, LOCALES, drafts=False))
    return tmp_path


class TestReadingArticles:
    def test_front_matter_is_read_with_its_dates(self, tmp_path: Path) -> None:
        path = write(tmp_path, "en", "hello", updated="2026-10-10")
        article = read_article(path)
        assert article.path == "/en/blog/hello"
        assert article.published == date(2026, 10, 7)
        assert article.updated == date(2026, 10, 10)
        assert article.tags == ("llm", "privacy")
        assert not article.draft

    def test_updated_defaults_to_the_publication_date(self, tmp_path: Path) -> None:
        article = read_article(write(tmp_path, "en", "hello"))
        assert article.updated == article.published

    def test_a_header_that_contradicts_its_folder_is_refused(
        self, tmp_path: Path
    ) -> None:
        """A file copied to the other language without updating its header."""
        path = write(tmp_path, "fr", "hello", lang="en")
        with pytest.raises(ValueError, match="lang and slug"):
            read_article(path)

    def test_drafts_are_left_out_unless_asked_for(self, blog: Path) -> None:
        published = load_articles(blog, LOCALES, drafts=False)
        assert {a.slug for a in published} == {"both", "french-only"}
        with_drafts = load_articles(blog, LOCALES, drafts=True)
        assert "secret" in {a.slug for a in with_drafts}

    def test_articles_come_newest_first(self, blog: Path) -> None:
        dates = [a.published for a in load_articles(blog, LOCALES, drafts=False)]
        assert dates == sorted(dates, reverse=True)

    def test_the_test_article_is_a_draft_absent_from_production(self) -> None:
        """hello-blog exists in both languages and must never be published."""
        assert (BLOG_ROOT / "fr" / "hello-blog.md").exists()
        assert (BLOG_ROOT / "en" / "hello-blog.md").exists()
        if not DRAFTS:
            assert "hello-blog" not in {a.slug for a in seo.ARTICLES}
        production = load_articles(BLOG_ROOT, LOCALES, drafts=False)
        assert "hello-blog" not in {a.slug for a in production}


class TestBlogInTheSitemap:
    async def test_published_articles_are_listed_with_their_lastmod(
        self, client: AsyncTestClient[Litestar], blog: Path
    ) -> None:
        response = await client.get("/sitemap.xml", headers={"host": "example.com"})
        text = response.text
        assert "<loc>http://example.com/fr/blog/both</loc>" in text
        assert "<loc>http://example.com/en/blog/both</loc>" in text
        assert "<loc>http://example.com/fr/blog/french-only</loc>" in text
        assert "<lastmod>2026-10-09</lastmod>" in text
        assert "<lastmod>2026-10-08</lastmod>" in text
        assert "secret" not in text
        # The blog index is a page of routes.json, in both languages.
        assert "<loc>http://example.com/fr/blog</loc>" in text
        assert "<loc>http://example.com/en/blog</loc>" in text

    async def test_alternates_only_when_both_languages_exist(
        self, client: AsyncTestClient[Litestar], blog: Path
    ) -> None:
        response = await client.get("/sitemap.xml", headers={"host": "example.com"})
        root = ElementTree.fromstring(response.text)
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        links = {
            url.findtext("s:loc", namespaces=ns): url.findall(
                "{http://www.w3.org/1999/xhtml}link"
            )
            for url in root.findall("s:url", ns)
        }
        both = links["http://example.com/en/blog/both"]
        assert {link.get("hreflang") for link in both} == {"fr", "en", "x-default"}
        assert links["http://example.com/fr/blog/french-only"] == []


class TestFeeds:
    async def test_each_language_has_a_valid_atom_feed(
        self, client: AsyncTestClient[Litestar], blog: Path
    ) -> None:
        for lang in LOCALES:
            response = await client.get(
                f"/{lang}/blog/feed.xml",
                headers={"host": "example.com", "x-forwarded-proto": "https"},
            )
            assert response.status_code == 200
            assert response.headers["content-type"].startswith("application/atom+xml")
            root = ElementTree.fromstring(response.text)
            assert root.tag == f"{ATOM}feed"
            assert root.get("{http://www.w3.org/XML/1998/namespace}lang") == lang
            assert root.findtext(f"{ATOM}id") == f"https://example.com/{lang}/blog"
            self_link = root.find(f"{ATOM}link[@rel='self']")
            assert self_link is not None
            assert self_link.get("href") == (
                f"https://example.com/{lang}/blog/feed.xml"
            )

    async def test_entries_are_the_language_s_articles_newest_first(
        self, client: AsyncTestClient[Litestar], blog: Path
    ) -> None:
        response = await client.get("/fr/blog/feed.xml", headers={"host": "x.test"})
        root = ElementTree.fromstring(response.text)
        entries = root.findall(f"{ATOM}entry")
        assert [e.findtext(f"{ATOM}id") for e in entries] == [
            "http://x.test/fr/blog/french-only",
            "http://x.test/fr/blog/both",
        ]
        first = entries[0]
        assert first.findtext(f"{ATOM}published") == "2026-10-08T00:00:00Z"
        # The description is escaped, not injected: `&` survives the round trip.
        assert first.findtext(f"{ATOM}summary") == "What french-only teaches & why."
        assert [c.get("term") for c in first.findall(f"{ATOM}category")] == [
            "llm",
            "privacy",
        ]
        # The feed's own date is its newest update.
        assert root.findtext(f"{ATOM}updated") == "2026-10-09T00:00:00Z"
        assert "secret" not in response.text

    async def test_an_empty_feed_is_still_valid(
        self, client: AsyncTestClient[Litestar], monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """Before the first article, a reader can subscribe already."""
        monkeypatch.setattr(seo, "ARTICLES", ())
        response = await client.get("/en/blog/feed.xml", headers={"host": "x.test"})
        root = ElementTree.fromstring(response.text)
        assert root.findall(f"{ATOM}entry") == []
        assert root.findtext(f"{ATOM}updated") == "2026-10-06T00:00:00Z"

    async def test_an_unknown_language_has_no_feed(
        self, client: AsyncTestClient[Litestar]
    ) -> None:
        response = await client.get("/de/blog/feed.xml")
        assert response.status_code == 404
