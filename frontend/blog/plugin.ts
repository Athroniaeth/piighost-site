/**
 * Le blog vu par Vite : deux modules virtuels, écrits à partir des fichiers
 * Markdown au moment du build.
 *
 *   virtual:blog                     la liste des articles publiés, sans leur
 *                                    corps, et une fonction de chargement par
 *                                    article
 *   virtual:blog/article/<lang>/<slug>
 *                                    l'arbre d'un article, dans son propre
 *                                    morceau de bundle
 *
 * Un article par morceau : l'index et les autres pages ne téléchargent aucun
 * corps d'article, et le bundle ne grossit pas avec le blog.
 *
 * Les brouillons sont retirés ici, donc de partout à la fois : routeur, index,
 * prérendu, et images copiées depuis public/. `BLOG_DRAFTS=1` les garde.
 */

import { existsSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Plugin, ResolvedConfig } from "vite";
import { lireArticles, type Article } from "./build.ts";

const LISTE = "virtual:blog";
const ARTICLE = "virtual:blog/article/";

export function blog(): Plugin {
  const brouillons = process.env.BLOG_DRAFTS === "1";
  let config: ResolvedConfig;
  let contenu = "";
  let articles: Article[] | null = null;
  const lire = () =>
    (articles ??= lireArticles({
      contenu,
      public: config.publicDir,
      brouillons,
    }));

  return {
    name: "piighost-blog",

    configResolved(resolu) {
      config = resolu;
      contenu = join(resolu.root, "src", "content", "blog");
    },

    resolveId(id) {
      if (id === LISTE || id.startsWith(ARTICLE)) return `\0${id}`;
    },

    load(id) {
      if (id === `\0${LISTE}`) {
        const tous = lire();
        const chargeurs = tous
          .map(
            ({ meta }) =>
              `  ${JSON.stringify(`${meta.lang}/${meta.slug}`)}: () => import(${JSON.stringify(`${ARTICLE}${meta.lang}/${meta.slug}`)}),`,
          )
          .join("\n");
        return [
          `export const ARTICLES = ${JSON.stringify(tous.map((a) => a.meta))};`,
          `export const CHARGEURS = {\n${chargeurs}\n};`,
        ].join("\n");
      }
      if (id.startsWith(`\0${ARTICLE}`)) {
        const [lang, slug] = id.slice(ARTICLE.length + 1).split("/");
        const article = lire().find(
          (a) => a.meta.lang === lang && a.meta.slug === slug,
        );
        if (!article) throw new Error(`blog : article inconnu ${lang}/${slug}`);
        return `export default ${JSON.stringify(article.nodes)};`;
      }
    },

    // En développement, un article modifié recharge la page : les modules
    // virtuels n'ont pas de fichier que Vite saurait surveiller seul.
    configureServer(serveur) {
      serveur.watcher.add(contenu);
      serveur.watcher.on("all", (_evenement, chemin) => {
        if (!chemin.startsWith(contenu)) return;
        articles = null;
        for (const environnement of Object.values(serveur.environments)) {
          for (const module of environnement.moduleGraph.idToModuleMap.values()) {
            if (module.id?.startsWith(`\0${LISTE}`)) {
              environnement.moduleGraph.invalidateModule(module);
            }
          }
        }
        serveur.ws.send({ type: "full-reload" });
      });
    },

    // public/ est copié tel quel : les images d'un brouillon partiraient en
    // production sans cette passe. On retire tout dossier de public/blog/ qui
    // n'appartient à aucun article publié.
    closeBundle() {
      const publies = new Set(lire().map((a) => a.meta.slug));
      const sortie = resolve(config.root, config.build.outDir, "blog");
      if (!existsSync(sortie)) return;
      for (const slug of lireDossiers(join(config.publicDir, "blog"))) {
        if (!publies.has(slug))
          rmSync(join(sortie, slug), { recursive: true, force: true });
      }
      if (readdirSync(sortie).length === 0) rmSync(sortie, { recursive: true });
    },
  };
}

/** Les sous-dossiers d'un dossier, aucun s'il n'existe pas. */
function lireDossiers(chemin: string): string[] {
  if (!existsSync(chemin)) return [];
  return readdirSync(chemin, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}
