#!/usr/bin/env python3
"""Reconstruit les icônes de `frontend/public/` depuis les SVG du dépôt.

Elles avaient été copiées une fois, pas fabriquées : changer la couleur du logo
laissait donc quatre PNG et un ICO dans l'ancienne, sans que rien ne le signale.
Le SVG fait foi, les rasters s'en déduisent.

Aucun rastériseur n'est installé sur la machine — ni rsvg-convert, ni Inkscape,
ni ImageMagick — donc tout passe par le Chrome de Playwright. L'ICO est un
conteneur multi-image et il est assemblé ici, faute d'outil.

    python3 scripts/icones.py

Portage de brand/outils/rasteriser.py de piighost-identite, qui lit les SVG de
la charte ; celui-ci lit ceux de ce dépôt, où la couleur peut différer.
"""

import pathlib
import struct
import subprocess
import sys
import tempfile

RACINE = pathlib.Path(__file__).resolve().parents[1]
LOGO = RACINE / "frontend/src/assets/logo"
SORTIE = RACINE / "frontend/public"
CHROME = pathlib.Path(
    "/home/ubuntu/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome"
)

# Le favicon est le fantôme nu, vérifié lisible à 16 px dans un onglet réel.
# Les icônes d'application sont le bloc : sur un écran d'accueil, une forme
# détourée disparaît dans le fond, alors qu'une tuile tient.
APPLICATIONS = [
    ("apple-touch-icon-180.png", "bloc.svg", 180),
    ("icon-192.png", "bloc.svg", 192),
    ("icon-512.png", "bloc.svg", 512),
    # Masquable : la zone sûre est un cercle de 80 %, d'où un bloc à part avec
    # plus de marge, sans quoi Android rogne les oreilles du fantôme.
    ("icon-maskable-512.png", "bloc-masquable.svg", 512),
]


def rendre(
    svg: pathlib.Path,
    taille: int,
    destination: pathlib.Path,
    hauteur: int | None = None,
) -> None:
    """Rend un SVG en PNG à fond transparent, à la taille exacte.

    `hauteur` sert aux formats qui ne sont pas carrés, la vignette de partage
    étant en 1200 x 630.
    """
    page = (
        "<!doctype html><meta charset='utf-8'>"
        "<style>html,body{margin:0;padding:0;background:transparent}"
        "img{position:absolute;inset:0;width:100%;height:100%}</style>"
        f"<img src='{svg.as_uri()}'>"
    )
    with tempfile.TemporaryDirectory() as tmp:
        chemin = pathlib.Path(tmp) / "page.html"
        chemin.write_text(page)
        destination.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            [
                str(CHROME), "--headless", "--no-sandbox", "--disable-gpu",
                "--force-color-profile=srgb", "--hide-scrollbars",
                "--default-background-color=00000000",
                f"--window-size={taille},{hauteur or taille}",
                "--virtual-time-budget=4000",
                f"--screenshot={destination}", str(chemin),
            ],
            check=False, capture_output=True, timeout=90,
        )
    if not destination.exists() or destination.stat().st_size == 0:
        sys.exit(f"rendu échoué : {destination}")


def assembler_ico(pngs: list[pathlib.Path], destination: pathlib.Path) -> None:
    """Assemble un ICO contenant des PNG, ce que tout navigateur moderne lit."""
    entrees, donnees = [], []
    decalage = 6 + 16 * len(pngs)
    for png in pngs:
        octets = png.read_bytes()
        largeur, hauteur = struct.unpack(">II", octets[16:24])
        entrees.append(
            struct.pack(
                "<BBBBHHII",
                0 if largeur >= 256 else largeur,
                0 if hauteur >= 256 else hauteur,
                0, 0, 1, 32, len(octets), decalage,
            )
        )
        donnees.append(octets)
        decalage += len(octets)
    destination.write_bytes(
        struct.pack("<HHH", 0, 1, len(pngs)) + b"".join(entrees) + b"".join(donnees)
    )


def main() -> None:
    if not CHROME.exists():
        sys.exit(f"Chrome introuvable : {CHROME}")

    with tempfile.TemporaryDirectory() as tmp:
        pour_ico = []
        # 256 comprise : le cahier des charges demande quatre images, et un
        # ICO sans elle rend flou dès qu'un système l'agrandit.
        for taille in (16, 32, 48, 256):
            chemin = pathlib.Path(tmp) / f"favicon-{taille}.png"
            rendre(LOGO / "favicon.svg", taille, chemin)
            pour_ico.append(chemin)
        assembler_ico(pour_ico, SORTIE / "favicon.ico")

        # La vignette de partage était le seul fichier encore copié à la main
        # plutôt que fabriqué, ce que l'en-tête de ce script reproche justement
        # aux icônes. Elle se rend comme les autres, depuis son SVG.
        rendre(LOGO / "og.svg", 1200, SORTIE / "og.png", hauteur=630)
        print(f"  og.png                 {(SORTIE / 'og.png').stat().st_size} o")
        print(f"  favicon.ico            {(SORTIE / 'favicon.ico').stat().st_size} o")

    for nom, source, taille in APPLICATIONS:
        rendre(LOGO / source, taille, SORTIE / nom)
        print(f"  {nom:<22} {(SORTIE / nom).stat().st_size} o")

    # Le SVG est servi tel quel, il n'a rien à rastériser ; on le recopie pour
    # que la source du favicon vectoriel et celle des rasters soient la même.
    (SORTIE / "favicon.svg").write_bytes((LOGO / "favicon.svg").read_bytes())
    print("  favicon.svg            recopié depuis les sources")


if __name__ == "__main__":
    main()
