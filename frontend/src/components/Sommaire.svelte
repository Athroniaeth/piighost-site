<script lang="ts">
  import { i18n } from "../lib/i18n.svelte";
  import { cn } from "../lib/cn";

  /**
   * Le repère de lecture, à droite de la page d'accueil.
   *
   * Il remplace le verrou de défilement : au lieu de contraindre la molette,
   * il dit où on est et laisse revenir où on veut. C'est le comportement des
   * sommaires de documentation, celui de Zensical entre autres.
   *
   * Chaque entrée est un vrai lien d'ancre. Le clic, l'ouverture dans un onglet
   * et la navigation au clavier viennent donc du navigateur, le défilement doux
   * de `scroll-behavior` et le décalage sous la barre collante de `scroll-mt`.
   * Le script ne sert qu'à dire laquelle est active.
   */
  let { sections }: { sections: { id: string; label: string }[] } = $props();

  let actif = $state(sections[0]?.id ?? "");

  $effect(() => {
    // La section active est celle qui traverse le milieu de l'écran. Les marges
    // négatives réduisent la zone d'observation à cette bande, ce qui évite
    // d'avoir à écouter le défilement et à recalculer des positions.
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (entree.isIntersecting) actif = entree.target.id;
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    for (const { id } of sections) {
      const cible = document.getElementById(id);
      if (cible) observateur.observe(cible);
    }
    return () => observateur.disconnect();
  });
</script>

<nav
  aria-label={i18n.t.sommaire.titre}
  class="pointer-events-none fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 pr-6 xl:block"
>
  <div class="pointer-events-auto relative">
    <!-- Le rail continu, derrière les crans : c'est lui qui fait lire la
         position comme une position, et non comme une simple liste. -->
    <span
      aria-hidden="true"
      class="absolute right-0 top-1 bottom-1 w-px bg-border"
    ></span>
    <ol class="flex flex-col items-end gap-1">
      {#each sections as section (section.id)}
        {@const courant = actif === section.id}
        <li>
          <a
            href="#{section.id}"
            aria-current={courant ? "true" : undefined}
            class="group flex items-center justify-end gap-3 rounded-md py-1 pl-2 text-xs
                   outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span
              class={cn(
                "transition-colors",
                courant
                  ? "font-medium text-primary"
                  : "text-muted-foreground group-hover:text-foreground",
              )}
            >
              {section.label}
            </span>
            <span
              class={cn(
                "h-px transition-all",
                courant
                  ? "w-8 bg-primary"
                  : "w-4 bg-border group-hover:w-6 group-hover:bg-foreground/40",
              )}
            ></span>
          </a>
        </li>
      {/each}
    </ol>
  </div>
</nav>
