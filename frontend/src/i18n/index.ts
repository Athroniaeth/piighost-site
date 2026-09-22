/**
 * Les dictionnaires, repris tels quels de piighost-studio.
 *
 * Ce sont des données, pas du code : ils traversent le changement de pile sans
 * une modification. La langue vient du routeur, donc de l'URL, ce qui rend
 * `/fr/...` et `/en/...` indexables séparément.
 */
export type {
  Locale,
  Dictionary,
  PhilosophyDict,
  FaqSegment,
  ProjectSection,
  ProjectPageDict,
} from "./types";
export { en } from "./en";
export { fr } from "./fr";

import { en } from "./en";
import { fr } from "./fr";

export const dictionaries = { en, fr } as const;
