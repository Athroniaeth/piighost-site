/**
 * Un HTML complet par URL, écrit après le build.
 *
 * Pourquoi cette étape existe : le site remplace un export statique Next où
 * chaque route était prérendue. Une application à page unique sert un seul
 * index.html, donc un robot et un aperçu de lien verraient la même page
 * générique sur les douze URL. Le dépôt piighost-seo mesure cette visibilité
 * tous les jours, et la perdre se verrait.
 *
 * Le rendu vient de Svelte lui-même, pas d'un navigateur sans tête : la sortie
 * est déterministe, il n'y a rien à attendre, et le build ne dépend pas d'un
 * Chrome installé.
 *
 *   node prerender.mjs        appelé par `pnpm build`
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const DIST = "dist";
const SSR = "./dist-ssr/entry-server.js";
/** La politique servie par nginx, écrite ici parce que les empreintes des blocs
 *  schema.org ne sont connues qu'après le rendu. deploy/security-headers.conf
 *  l'inclut, Dockerfile.web la copie dans l'image. */
const CSP = "csp.conf";

const { rendre, toutesLesUrls } = await import(SSR);

const gabarit = await readFile(join(DIST, "index.html"), "utf8");

/** Remplace une balise entière, ou l'ajoute si elle manque. */
function poser(html, motif, remplacement) {
  return motif.test(html) ? html.replace(motif, remplacement) : html;
}

const echappe = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Les empreintes des blocs schema.org, dédoublonnées entre les douze pages.
 *  La CSP est script-src 'self' sans unsafe-inline : un bloc non autorisé est
 *  refusé par le navigateur, et les données structurées disparaissent sans que
 *  rien ne le signale. */
const empreintes = new Set();

/** Un bloc ld+json prêt à écrire, et son empreinte. */
function structuree(donnees) {
  // Un `<` échappé dans les chaînes : sans cela une valeur contenant
  // `</script>` fermerait la balise depuis l'intérieur.
  const json = JSON.stringify(donnees).replace(/</g, "\\u003c");
  const hash = createHash("sha256").update(json, "utf8").digest("base64");
  empreintes.add(`'sha256-${hash}'`);
  return `<script type="application/ld+json">${json}</script>`;
}

let ecrites = 0;
for (const { url, nom, locale } of toutesLesUrls()) {
  const { corps, tete, titre, description, lang, jsonld } = rendre(nom, locale);

  let html = gabarit;
  html = html.replace('<html lang="fr">', `<html lang="${lang}">`);
  html = poser(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title>${echappe(titre)}</title>`,
  );
  html = poser(
    html,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${echappe(description)}" />`,
  );
  html = poser(
    html,
    /<link rel="canonical"[^>]*\/>/,
    `<link rel="canonical" href="https://piighost.dev${url}" />`,
  );
  html = poser(
    html,
    /<meta property="og:title"[^>]*\/>/,
    `<meta property="og:title" content="${echappe(titre)}" />`,
  );
  html = poser(
    html,
    /<meta property="og:description"[^>]*\/>/,
    `<meta property="og:description" content="${echappe(description)}" />`,
  );
  html = poser(
    html,
    /<meta property="og:url"[^>]*\/>/,
    `<meta property="og:url" content="https://piighost.dev${url}" />`,
  );
  const structurees = jsonld.map(structuree).join("\n    ");
  html = html.replace("</head>", `  ${tete}\n    ${structurees}\n  </head>`);
  html = html.replace('<div id="app"></div>', `<div id="app">${corps}</div>`);

  const chemin = join(DIST, url.replace(/^\//, ""), "index.html");
  await mkdir(dirname(chemin), { recursive: true });
  await writeFile(chemin, html);
  ecrites += 1;
}

const politique = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data:",
  "style-src 'self'",
  `script-src 'self' ${[...empreintes].sort().join(" ")}`,
  "connect-src 'self'",
  "form-action 'self'",
].join("; ");

await writeFile(
  CSP,
  [
    "# Généré par frontend/prerender.mjs. Ne pas éditer à la main.",
    "#",
    "# script-src porte l'empreinte de chaque bloc schema.org écrit dans les pages.",
    "# Un bloc ld+json est un élément script : sans son empreinte, la politique le",
    "# refuse et les données structurées du site disparaissent en silence.",
    `add_header Content-Security-Policy "${politique}" always;`,
    "",
  ].join("\n"),
);

console.log(
  `prérendu : ${ecrites} pages écrites dans ${DIST}/, ` +
    `${empreintes.size} empreintes dans ${CSP}`,
);
