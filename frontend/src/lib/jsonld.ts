/**
 * Les données structurées, reprises du site actuel.
 *
 * Elles ne sont pas rendues par un composant : le prérendu les écrit dans la
 * tête de chaque HTML, et calcule au passage l'empreinte que la politique de
 * sécurité doit autoriser. Un composant les réinjecterait à l'hydratation, ce
 * qui les dupliquerait sur une page déjà servie complète, et surtout le
 * contenu changerait d'une page à l'autre sans que la CSP le sache.
 */

import type { FaqSegment } from "../i18n/types";
import { dictionaries } from "../i18n";
import { ORIGINE, lien, type Locale, type NomDePage } from "./routes";

const REPO = "https://github.com/Athroniaeth/piighost";
const PYPI = "https://pypi.org/project/piighost/";
const DESC =
  "piighost is an open-source Python library that anonymizes personally identifiable information before it reaches a large language model, using composable regex, NER and LLM detection pipelines with stable, reversible placeholders.";

const organisation = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "piighost",
  url: `${ORIGINE}/`,
  description: DESC,
  sameAs: [REPO, PYPI],
});

const siteWeb = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "piighost",
  url: `${ORIGINE}/`,
  description: DESC,
});

const application = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "piighost",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Cross-platform",
  programmingLanguage: "Python",
  description: DESC,
  url: `${ORIGINE}/en/projects/piighost`,
  downloadUrl: PYPI,
  softwareHelp: "https://athroniaeth.github.io/piighost/",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
});

const codeSource = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: "piighost",
  description: DESC,
  codeRepository: REPO,
  programmingLanguage: "Python",
  runtimePlatform: "Python 3",
});

const filAriane = (items: { name: string; item: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: it.item,
  })),
});

/** Aplatit une réponse de FAQ : le schéma FAQPage attend du texte brut. */
function aplatir(answer: FaqSegment[]): string {
  return answer
    .map((seg) =>
      typeof seg === "string" ? seg : "code" in seg ? seg.code : seg.link.text,
    )
    .join("");
}

const faq = (locale: Locale) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: dictionaries[locale].faq.items.map((x) => ({
    "@type": "Question",
    name: x.question,
    acceptedAnswer: { "@type": "Answer", text: aplatir(x.answer) },
  })),
});

/** Ce qu'une page déclare. L'organisation et le site sont sur toutes, comme
 *  dans la mise en page du site actuel. */
export function donneesStructurees(nom: NomDePage, locale: Locale): object[] {
  const communes = [organisation(), siteWeb()];
  if (nom === "home") return [...communes, faq(locale)];
  if (nom === "piighost") {
    return [
      ...communes,
      application(),
      codeSource(),
      filAriane([
        { name: "Home", item: `${ORIGINE}${lien("home", locale)}` },
        { name: "piighost", item: `${ORIGINE}${lien("piighost", locale)}` },
      ]),
    ];
  }
  return communes;
}
