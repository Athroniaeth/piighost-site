/** Les modules que frontend/blog/plugin.ts écrit au build. */
declare module "virtual:blog" {
  import type { ArticleMeta } from "../blog/build";
  import type { ContentNode } from "@piighost/ui/content";

  /** Les articles publiés, toutes langues, le plus récent d'abord. */
  export const ARTICLES: ArticleMeta[];
  /** Le corps de chaque article, chargé à la demande, par `<lang>/<slug>`. */
  export const CHARGEURS: Record<
    string,
    () => Promise<{ default: ContentNode[] }>
  >;
}
