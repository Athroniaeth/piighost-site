<script lang="ts">
  import Hero from "../components/landing/Hero.svelte";
  import Problem from "../components/landing/Problem.svelte";
  import Detector from "../components/landing/Detector.svelte";
  import HowItWorks from "../components/landing/HowItWorks.svelte";
  import Ecosystem from "../components/landing/Ecosystem.svelte";
  import QuickStart from "../components/landing/QuickStart.svelte";
  import Faq from "../components/landing/Faq.svelte";
  import Cta from "../components/landing/Cta.svelte";
  import Sommaire from "../components/Sommaire.svelte";
  import { i18n } from "../lib/i18n.svelte";

  // L'ordre est celui du balisage : le repère se lit comme la page se parcourt.
  const sections = $derived([
    { id: "overview", label: i18n.t.sommaire.overview },
    { id: "problem", label: i18n.t.sommaire.problem },
    { id: "detector", label: i18n.t.sommaire.detector },
    { id: "how-it-works", label: i18n.t.sommaire.howItWorks },
    { id: "ecosystem", label: i18n.t.sommaire.ecosystem },
    { id: "quick-start", label: i18n.t.sommaire.quickStart },
    { id: "faq", label: i18n.t.sommaire.faq },
    { id: "get-started", label: i18n.t.sommaire.getStarted },
  ]);
</script>

<Hero />
<Problem />
<Detector />
<HowItWorks />
<Ecosystem />
<QuickStart />
<Faq />
<Cta />

<Sommaire {sections} />
