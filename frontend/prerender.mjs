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

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const DIST = "dist";
const SSR = "./dist-ssr/entry-server.js";

const { rendre, toutesLesUrls } = await import(SSR);

const gabarit = await readFile(join(DIST, "index.html"), "utf8");

/** Remplace une balise entière, ou l'ajoute si elle manque. */
function poser(html, motif, remplacement) {
  return motif.test(html) ? html.replace(motif, remplacement) : html;
}

const echappe = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

let ecrites = 0;
for (const { url, nom, locale } of toutesLesUrls()) {
  const { corps, tete, titre, description, lang } = rendre(nom, locale);

  let html = gabarit;
  html = html.replace('<html lang="fr">', `<html lang="${lang}">`);
  html = poser(html, /<title>[\s\S]*?<\/title>/, `<title>${echappe(titre)}</title>`);
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
  html = html.replace("</head>", `  ${tete}\n  </head>`);
  html = html.replace('<div id="app"></div>', `<div id="app">${corps}</div>`);

  const chemin = join(DIST, url.replace(/^\//, ""), "index.html");
  await mkdir(dirname(chemin), { recursive: true });
  await writeFile(chemin, html);
  ecrites += 1;
}

console.log(`prérendu : ${ecrites} pages écrites dans ${DIST}/`);
