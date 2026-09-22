#!/usr/bin/env python3
"""Compose la page de comparaison des thèmes de coloration.

Le fragment coloré vient du tokeniseur du site (`lib/highlight.ts`), pas d'un
balisage écrit à la main : une comparaison sur un extrait balisé autrement que
la production compare autre chose que la production.

    npx tsx scratch/jetons.mts > /tmp/snippet.html
    python3 scratch/themes-code.py

Sortie : scratch/themes-code.html, puis une capture par
`brand/outils/capturer.sh` de piighost-identite.
"""

import pathlib

ICI = pathlib.Path(__file__).resolve().parent
FRAGMENT = pathlib.Path("/tmp/snippet.html")

# Les palettes publiées, reprises telles quelles. Les trois seules qui comptent
# ici sont `comment`, `string` et `keyword` : ce sont elles qui portent la
# lisibilité d'un extrait, le reste suit.
THEMES = {
    "vscode": {
        "nom": "VS Code",
        "detail": "Light+ et Dark+, le thème par défaut de l'éditeur",
        "clair": {
            "comment": "#008000", "string": "#a31515", "keyword": "#0000ff",
            "boolean": "#0000ff", "number": "#098658", "function": "#795e26",
            "punctuation": "#000000", "text": "#001080",
        },
        "sombre": {
            "comment": "#6a9955", "string": "#ce9178", "keyword": "#569cd6",
            "boolean": "#569cd6", "number": "#b5cea8", "function": "#dcdcaa",
            "punctuation": "#d4d4d4", "text": "#9cdcfe",
        },
    },
    "github": {
        "nom": "GitHub",
        "detail": "Primer, les couleurs de github.com",
        "clair": {
            "comment": "#6e7781", "string": "#0a3069", "keyword": "#cf222e",
            "boolean": "#0550ae", "number": "#0550ae", "function": "#8250df",
            "punctuation": "#24292f", "text": "#24292f",
        },
        "sombre": {
            "comment": "#8b949e", "string": "#a5d6ff", "keyword": "#ff7b72",
            "boolean": "#79c0ff", "number": "#79c0ff", "function": "#d2a8ff",
            "punctuation": "#c9d1d9", "text": "#c9d1d9",
        },
    },
    "actuel": {
        "nom": "Actuel",
        "detail": "les pastilles d'entités réemployées, ce qui tourne aujourd'hui",
        "clair": {
            "comment": "var(--muted-foreground)", "string": "var(--entite-04-puce)",
            "keyword": "var(--entite-06-puce)", "boolean": "var(--entite-06-puce)",
            "number": "var(--entite-01-puce)", "function": "var(--entite-05-puce)",
            "punctuation": "var(--muted-foreground)", "text": "var(--foreground)",
        },
        "sombre": None,  # mêmes noms de tokens, les valeurs suivent .dark
    },
}

KINDS = ["comment", "string", "keyword", "boolean", "number", "function",
         "punctuation", "text"]


def regles(cle: str, theme: dict) -> str:
    lignes = []
    for mode, selecteur in (("clair", f".t-{cle}"), ("sombre", f".dark .t-{cle}")):
        couleurs = theme.get(mode)
        if couleurs is None:
            continue
        for kind in KINDS:
            lignes.append(f"{selecteur} .tok-{kind} {{ color: {couleurs[kind]}; }}")
    return "\n".join(lignes)


def main() -> None:
    fragment = FRAGMENT.read_text(encoding="utf-8")
    styles = "\n".join(regles(c, t) for c, t in THEMES.items())
    blocs = "\n".join(
        f'''    <section class="col">
      <h3>{t["nom"]}</h3>
      <p class="sub">{t["detail"]}</p>
      <pre class="code t-{c}">{fragment}</pre>
    </section>'''
        for c, t in THEMES.items()
    )
    page = f"""<!doctype html>
<meta charset="utf-8">
<title>piighost — trois colorations de code</title>
<link rel="stylesheet" href="../frontend/src/app.css">
<style>
  body {{ margin: 0; background: var(--background); color: var(--foreground);
         font-family: var(--font-sans), system-ui; }}
  .page {{ max-width: 1360px; margin: 0 auto; padding: 28px 24px 40px; }}
  h1 {{ font-size: 22px; margin: 0 0 4px; letter-spacing: -0.02em; }}
  .lede {{ color: var(--muted-foreground); font-size: 14px; margin: 0 0 22px; }}
  .grille {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }}
  h3 {{ font-size: 14px; margin: 0 0 2px; }}
  .sub {{ color: var(--muted-foreground); font-size: 12px; margin: 0 0 10px; }}
  .code {{ font-family: var(--font-mono), ui-monospace; font-size: 11.5px;
           line-height: 1.75; margin: 0; padding: 14px;
           border: 1px solid var(--border); border-radius: var(--radius);
           background: color-mix(in oklab, var(--muted) 30%, var(--background));
           white-space: pre-wrap; overflow-wrap: break-word; }}
  .bande {{ margin-top: 26px; padding-top: 18px; border-top: 1px solid var(--border); }}
{styles}
</style>
<div class="page">
  <h1>Trois colorations, sur l'extrait du site</h1>
  <p class="lede">
    Même code, même tokeniseur, mêmes fonds que la production. Seules les
    couleurs changent.
  </p>
  <div class="grille">
{blocs}
  </div>
</div>
"""
    (ICI / "themes-code.html").write_text(page, encoding="utf-8")
    print("écrit :", ICI / "themes-code.html")


if __name__ == "__main__":
    main()
