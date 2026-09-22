/**
 * La teinte d'une entité, par sa catégorie.
 *
 * La charte a tranché : la teinte dit la catégorie, l'intensité dit l'état.
 * Une valeur encore en clair prend le niveau pâle, son jeton le niveau
 * renforcé. C'est ce qui remplace l'ambre que le site employait pour la donnée
 * brute : l'ambre disait l'état, et disait donc l'inverse du playground, où la
 * même couleur veut dire `ORG`. Voir brand/tokens/README.md.
 *
 * Les catégories ne sont pas épinglées à une teinte par la charte ; celles-ci
 * suivent l'ordre de la palette, et les sept qui apparaissent ensemble dans la
 * démonstration du bandeau occupent sept teintes distinctes.
 */
import { entityClass, type ValueState } from "./labels";

const TEINTES: Record<string, number> = {
  PERSON: 1,
  ORG: 2,
  ADDRESS: 3,
  LOCATION: 4,
  LOC: 4,
  EMAIL: 5,
  PHONE: 6,
  ID: 7,
  DATE: 8,
};

/** La catégorie lue dans le jeton : `<<PERSON:1>>` donne `PERSON`. */
export function categorieDe(jeton: string): string {
  return jeton.replace(/^<</, "").replace(/>>$/, "").split(":")[0];
}

/** La classe d'une valeur, d'après son jeton et son état. */
export function classeDe(jeton: string, etat: ValueState): string {
  return entityClass(TEINTES[categorieDe(jeton)] ?? 1, etat);
}
