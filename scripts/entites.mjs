/**
 * Génère la palette des entités, et refuse de la rendre si elle ne passe pas.
 *
 * L'ordre est une demande : rouge, orange, jaune en tête, puis le reste du
 * spectre. Aucune teinte dans la bande violette — 265 à 305 degrés — parce que
 * la primaire du site y vit, et qu'une valeur détectée ne doit pas porter la
 * couleur des actions.
 *
 * Les clartés et les chromas sont ceux du fichier d'origine, repris tels quels :
 * ce sont eux qui donnent au système sa cohérence. Seules les teintes changent.
 * Le chroma est ramené dans le gamut sRGB teinte par teinte, parce qu'un jaune
 * ne tient pas la même saturation qu'un bleu à clarté égale.
 *
 * Les quatre paires de chaque entité sont mesurées contre leur propre fond, et
 * le script sort en erreur si l'une tombe sous 4.5:1. Une palette générée qui
 * échoue en silence est pire qu'une palette écrite à la main.
 *
 *     node scripts/entites.mjs           # affiche le bloc CSS et le rapport
 *     node scripts/entites.mjs --ecrire  # remplace le bloc dans app.css
 */

import { readFileSync, writeFileSync } from "node:fs";
import { oklchVersHex } from "../../piighost-identite/brand/outils/oklch.mjs";

const TEINTES = [
  ["01", 27, "rouge"],
  ["02", 55, "orange"],
  ["03", 85, "jaune"],
  ["04", 140, "vert"],
  ["05", 175, "sarcelle"],
  ["06", 215, "cyan"],
  ["07", 245, "bleu"],
  ["08", 330, "magenta"],
];

// Le gabarit : une clarté et un chroma visé par rôle, identiques pour toutes
// les teintes. Le chroma réel est celui que le gamut autorise.
const GABARIT = {
  clair: {
    "valeur-fond": [0.935, 0.05],
    "valeur-texte": [0.53, 0.15],
    "jeton-fond": [0.855, 0.11],
    "jeton-texte": [0.47, 0.15],
    puce: [0.62, 0.16],
  },
  sombre: {
    "valeur-fond": [0.305, 0.07],
    "valeur-texte": [0.7, 0.13],
    "jeton-fond": [0.4, 0.09],
    "jeton-texte": [0.78, 0.13],
    puce: [0.62, 0.16],
  },
};

const VIOLET = [265, 305];

/** Luminance relative WCAG, depuis un hexadécimal. */
function luminance(hex) {
  const canal = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

const contraste = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const rendre = ([L, C], H) => oklchVersHex(L, C, H, { ajuster: true });

/**
 * Cherche la clarté du texte qui atteint le contraste visé sur son fond.
 *
 * Une clarté fixe ne traverse pas la roue : à L 0.53, un rouge tient 4.9:1 sur
 * son fond et un cyan 4.3:1, parce que l'œil tire beaucoup plus de luminance
 * d'un cyan que d'un rouge à clarté perceptuelle égale. Le gabarit donne donc
 * un point de départ, et le pas descend jusqu'à ce que la mesure passe.
 *
 * En sombre on remonte au lieu de descendre : le texte y est plus clair que son
 * fond.
 */
function resoudre([L, C], fond, H, cible, sens) {
  for (let i = 0; i <= 60; i += 1) {
    const essai = L + sens * i * 0.005;
    if (essai <= 0.05 || essai >= 0.98) break;
    const { hex, chroma } = rendre([essai, C], H);
    if (contraste(hex, fond) >= cible) return [essai, chroma, hex];
  }
  const { hex, chroma } = rendre([L, C], H);
  return [L, chroma, hex];
}

function construire() {
  const lignes = { clair: [], sombre: [] };
  const rapport = [];
  let echecs = 0;

  for (const [numero, teinte, nom] of TEINTES) {
    if (teinte >= VIOLET[0] && teinte <= VIOLET[1]) {
      console.error(`teinte ${teinte} (${nom}) est dans la bande violette`);
      process.exit(1);
    }
    for (const mode of ["clair", "sombre"]) {
      const sens = mode === "clair" ? -1 : +1;
      const resolu = {};

      // Les fonds et la pastille suivent le gabarit ; seuls les deux textes se
      // cherchent une clarté.
      for (const role of ["valeur-fond", "jeton-fond", "puce"]) {
        const [L, C] = GABARIT[mode][role];
        resolu[role] = { L, chroma: rendre([L, C], teinte).chroma };
      }
      for (const [texte, fond] of [
        ["valeur-texte", "valeur-fond"],
        ["jeton-texte", "jeton-fond"],
      ]) {
        const surFond = rendre(GABARIT[mode][fond], teinte).hex;
        const [L, chroma, hex] = resoudre(
          GABARIT[mode][texte], surFond, teinte, 4.6, sens,
        );
        resolu[texte] = { L, chroma };
        const ratio = contraste(hex, surFond);
        if (ratio < 4.5) echecs += 1;
        rapport.push(
          `  ${numero} ${nom.padEnd(9)} ${mode.padEnd(7)} ${texte.padEnd(13)}` +
            ` ${hex} sur ${surFond}  ${ratio.toFixed(2)}` +
            `${ratio < 4.5 ? "  ÉCHEC" : ""}`,
        );
      }

      for (const role of Object.keys(GABARIT[mode])) {
        const { L, chroma } = resolu[role];
        lignes[mode].push(
          `  --entite-${numero}-${role}: oklch(${L.toFixed(3)} ` +
            `${chroma.toFixed(4)} ${teinte});`,
        );
      }
    }
  }
  return { lignes, rapport, echecs };
}

const { lignes, rapport, echecs } = construire();
console.error(rapport.join("\n"));
console.error(`\n${echecs} paire(s) sous 4.5:1`);
if (echecs) process.exit(1);

const bloc = {
  clair: lignes.clair.join("\n"),
  sombre: lignes.sombre.join("\n"),
};

if (!process.argv.includes("--ecrire")) {
  console.log("/* clair */\n" + bloc.clair + "\n\n/* sombre */\n" + bloc.sombre);
  process.exit(0);
}

const chemin = new URL("../frontend/src/app.css", import.meta.url);
let css = readFileSync(chemin, "utf8");

// Les deux suites contiguës de déclarations `--entite-*`, la claire puis la
// sombre. Localisées d'abord, remplacées ensuite de la fin vers le début : une
// substitution successive réécrirait la première deux fois, puisque le bloc
// qu'elle vient d'écrire redevient la première occurrence. C'est exactement ce
// qui est arrivé, et le site a servi ses puces sombres en mode clair.
const motif = /(?:^ {2}--entite-[0-9]{2}-[a-z-]+: [^;]+;\n)+/gm;
const trouves = [...css.matchAll(motif)];
if (trouves.length !== 2) {
  console.error(`attendu 2 blocs d'entités dans app.css, trouvé ${trouves.length}`);
  process.exit(1);
}
for (const [index, mode] of [...["clair", "sombre"].entries()].reverse()) {
  const m = trouves[index];
  css = css.slice(0, m.index) + bloc[mode] + "\n" + css.slice(m.index + m[0].length);
}
writeFileSync(chemin, css);
console.error("app.css mis à jour : bloc clair puis bloc sombre");
