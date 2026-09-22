/**
 * La substitution qui se joue, une valeur après l'autre.
 *
 * Le site actuel anime ses démonstrations : les entités deviennent des jetons
 * une par une, marquent une pause, puis reviennent. C'est ce qui montre le
 * mécanisme au lieu de le décrire, et c'est repris tel quel.
 *
 * L'animation s'arrête si le visiteur a demandé moins de mouvement, et elle ne
 * démarre pas du tout au prérendu, où il n'y a ni fenêtre ni minuteur.
 */

const PAS_MS = 650;
const PAUSE_MS = 1500;

const NAVIGATEUR = typeof window !== "undefined";

export function mouvementReduit(): boolean {
  return (
    NAVIGATEUR && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export class Flux {
  /** Combien d'entités sont actuellement remplacées par leur jeton. */
  remplacees = $state(0);
  /** Celle qui vient de changer, pour la faire battre une fraction de seconde. */
  battement = $state<number | null>(null);
  /** Vrai quand la boîte montre des jetons, ce qui change son étiquette. */
  enJetons = $state(false);

  #total: number;
  #annule = false;

  constructor(total: number, demarreEnJetons = false) {
    this.#total = total;
    this.remplacees = demarreEnJetons ? total : 0;
    this.enJetons = demarreEnJetons;
  }

  /** Lance la boucle. Rend la fonction d'arrêt, à rendre à `$effect`. */
  demarrer(): () => void {
    if (!NAVIGATEUR || mouvementReduit()) return () => {};
    this.#annule = false;
    void this.#boucle();
    return () => {
      this.#annule = true;
    };
  }

  async #boucle() {
    const dormir = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    let jetons = this.enJetons;
    while (!this.#annule) {
      await dormir(PAUSE_MS);
      if (this.#annule) return;

      // Dans un sens on masque, dans l'autre on restitue : c'est la même
      // boucle lue à l'endroit ou à l'envers.
      const indices = jetons
        ? Array.from({ length: this.#total }, (_, i) => this.#total - 1 - i)
        : Array.from({ length: this.#total }, (_, i) => i);

      for (const i of indices) {
        if (this.#annule) return;
        this.battement = i;
        this.remplacees = jetons ? i : i + 1;
        await dormir(PAS_MS);
      }
      if (this.#annule) return;
      jetons = !jetons;
      this.enJetons = jetons;
      this.battement = null;
    }
  }
}

/** Une valeur détectée et le jeton qui la remplace. */
export type Entite = { brut: string; jeton: string };

/** Une phrase se lit comme une suite de textes et de renvois vers une entité. */
export type Segment = { texte: string } | { entite: number };

export const txt = (texte: string): Segment => ({ texte });
export const ent = (entite: number): Segment => ({ entite });

export const estTexte = (s: Segment): s is { texte: string } => "texte" in s;
