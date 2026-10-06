<script lang="ts">
  import SiteHeader from "./components/SiteHeader.svelte";
  import SiteFooter from "./components/SiteFooter.svelte";
  import BackToTop from "./components/BackToTop.svelte";
  import Home from "./pages/Home.svelte";
  import Philosophy from "./pages/Philosophy.svelte";
  import Blog from "./pages/Blog.svelte";
  import Article from "./pages/Article.svelte";
  import Projet from "./pages/Projet.svelte";
  import Introuvable from "./pages/Introuvable.svelte";
  import { router } from "./lib/router.svelte";
  import { appliquer } from "./lib/head";
  import { track } from "./lib/analytics";

  const PROJETS = [
    "piighost",
    "api",
    "chat",
    "proofreader",
    "caviardage",
  ] as const;
  type Slug = (typeof PROJETS)[number];
  const estProjet = (n: string): n is Slug =>
    (PROJETS as readonly string[]).includes(n);

  // Les balises et la mesure suivent la route, pas le chargement : sans cela
  // l'onglet garderait le titre de la première page visitée.
  $effect(() => {
    if (router.introuvable) return;
    appliquer(router.route);
    track({
      name: "page_view",
      props: {
        page: router.nom,
        locale: router.locale,
        ...(router.article && { article: router.article }),
      },
    });
  });
</script>

<div class="flex min-h-dvh flex-col">
  <SiteHeader />
  <main id="contenu" class="flex-1">
    {#if router.introuvable}
      <Introuvable />
    {:else if router.nom === "home"}
      <Home />
    {:else if router.nom === "philosophy"}
      <Philosophy />
    {:else if router.nom === "blog" && router.article}
      <Article slug={router.article} />
    {:else if router.nom === "blog"}
      <Blog />
    {:else if estProjet(router.nom)}
      <Projet slug={router.nom} />
    {/if}
  </main>
  <SiteFooter />
</div>
<BackToTop />
