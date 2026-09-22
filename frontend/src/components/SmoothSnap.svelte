<script lang="ts">
  /**
   * Le défilement par sections, une section par coup de molette.
   *
   * `scroll-snap-type` seul laisse la molette traverser deux sections d'un
   * geste ; ce verrou de 650 ms est ce qui donne à la page d'accueil son rythme
   * d'un écran à la fois. Il se désactive entièrement si le visiteur demande
   * moins de mouvement, et il laisse passer la molette dans tout élément qui
   * défile déjà pour son compte, sinon un bloc de code deviendrait impossible
   * à parcourir.
   */
  const VERROU_MS = 650;
  const DELTA_MIN = 2;

  function dansUnDefilant(cible: EventTarget | null): boolean {
    let el = cible instanceof Element ? cible : null;
    while (el && el !== document.body) {
      const debordement = getComputedStyle(el).overflowY;
      if (
        (debordement === "auto" || debordement === "scroll") &&
        el.scrollHeight > el.clientHeight
      ) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  $effect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let verrouille = false;
    let minuteur: ReturnType<typeof setTimeout> | null = null;

    function courante(liste: HTMLElement[]): number {
      const sonde = scrollY + innerHeight / 2;
      let index = 0;
      liste.forEach((el, i) => {
        if (el.offsetTop <= sonde) index = i;
      });
      return index;
    }

    function surMolette(event: WheelEvent) {
      if (event.ctrlKey) return;
      if (Math.abs(event.deltaY) < DELTA_MIN) return;
      if (dansUnDefilant(event.target)) return;

      if (verrouille) {
        event.preventDefault();
        return;
      }

      const liste = Array.from(
        document.querySelectorAll<HTMLElement>(".snap-start"),
      );
      if (liste.length === 0) return;

      const suivante = courante(liste) + (event.deltaY > 0 ? 1 : -1);
      if (suivante < 0 || suivante >= liste.length) return;

      event.preventDefault();
      verrouille = true;
      liste[suivante].scrollIntoView({ behavior: "smooth", block: "start" });

      if (minuteur) clearTimeout(minuteur);
      minuteur = setTimeout(() => (verrouille = false), VERROU_MS);
    }

    addEventListener("wheel", surMolette, { passive: false });
    return () => {
      removeEventListener("wheel", surMolette);
      if (minuteur) clearTimeout(minuteur);
    };
  });
</script>
