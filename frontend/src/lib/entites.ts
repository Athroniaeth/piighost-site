/**
 * La teinte d'une entité, par sa catégorie.
 *
 * Une seule information circule sur une valeur mise en couleur : **de quelle
 * catégorie elle est**. La teinte le dit, et rien d'autre ne s'y ajoute.
 *
 * Le système en portait une seconde, l'intensité, qui disait si la valeur
 * était encore en clair ou déjà remplacée par son jeton. Écartée : une valeur
 * et son jeton se ressemblent désormais trait pour trait, et c'est le texte
 * qui dit le changement. Les tokens `-jeton-*` existent toujours, générés par
 * scripts/entites.mjs, mais ce site ne les emploie plus.
 *
 * Les catégories ne sont pas épinglées à une teinte par la charte ; celles-ci
 * suivent l'ordre de la palette, et les sept qui apparaissent ensemble dans la
 * démonstration du bandeau occupent sept teintes distinctes.
 */
import { entityClass } from "./labels";

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

/** La classe d'une valeur, d'après sa seule catégorie. */
export function classeDe(jeton: string): string {
  return entityClass(TEINTES[categorieDe(jeton)] ?? 1, "valeur");
}
