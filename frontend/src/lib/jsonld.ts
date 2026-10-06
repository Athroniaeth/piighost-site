/**
 * Les données structurées, reprises du site actuel.
 *
 * Elles ne sont pas rendues par un composant : le prérendu les écrit dans la
 * tête de chaque HTML, et calcule au passage l'empreinte que la politique de
 * sécurité doit autoriser. Un composant les réinjecterait à l'hydratation, ce
 * qui les dupliquerait sur une page déjà servie complète, et surtout le
 * contenu changerait d'une page à l'autre sans que la CSP le sache.
 *
 * Chaque bloc est écrit dans la langue de la page. Les moteurs de réponse
 * reprennent souvent la description schema.org mot pour mot, et une page
 * française qui se décrit en anglais leur donne la mauvaise phrase.
 */

import type { FaqSegment } from "../i18n/types";
import { dictionaries } from "../i18n";
import { ORIGINE, lien, type Locale, type NomDePage } from "./routes";
import {
  DISCORD_URL,
  GITHUB_ORG,
  PIIGHOST_VERSION,
  docsPiighost,
  getProject,
} from "./site";

const REPO = "https://github.com/Athroniaeth/piighost";
const PYPI = "https://pypi.org/project/piighost/";
const DOCS = "https://docs.piighost.dev/";
const CATALOGUE = "https://catalog.piighost.dev/";
const MIT = "https://opensource.org/licenses/MIT";
const LOGO = `${ORIGINE}/icon-512.png`;
const IMAGE = `${ORIGINE}/og.png`;

/** La graphie affichée est `piighost`. L'autre, qu'on trouve encore dans des
 *  articles et des dépôts, est déclarée ici pour qu'un graphe d'entités n'y
 *  voie pas deux noms. */
const NOM = "piighost";
const AUTRE_NOM = "PIIGhost";

/** La phrase canonique, la même partout où une ligne doit dire ce que fait
 *  piighost. */
const DESCRIPTION: Record<Locale, string> = {
  en: "piighost is an open-source Python library that de-identifies personal data for LLM agents. piighost replaces personal data with placeholders before the LLM sees it, then restores the real values in the reply and in tool calls.",
  fr: "piighost est une bibliothèque Python open source qui dé-identifie les données personnelles pour les agents LLM. piighost remplace les données personnelles par des jetons avant que le LLM ne les voie, puis restaure les vraies valeurs dans la réponse et dans les appels d'outils.",
};

/** Le mot de la page d'accueil dans le fil d'Ariane. */
const ACCUEIL: Record<Locale, string> = { en: "Home", fr: "Accueil" };

/** L'identifiant de l'organisation. L'éditeur de chaque bloc y renvoie, pour
 *  que tous désignent une seule entité. */
const ID_ORGANISATION = `${ORIGINE}/#organization`;

const auteur = () => ({
  "@type": "Person",
  name: "Athroniaeth",
  url: GITHUB_ORG,
});

const organisation = (locale: Locale) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ID_ORGANISATION,
  name: NOM,
  alternateName: AUTRE_NOM,
  url: `${ORIGINE}/`,
  logo: LOGO,
  description: DESCRIPTION[locale],
  sameAs: [REPO, PYPI, DOCS, CATALOGUE, DISCORD_URL],
});

const siteWeb = (locale: Locale) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: NOM,
  alternateName: AUTRE_NOM,
  url: `${ORIGINE}/`,
  description: DESCRIPTION[locale],
  inLanguage: ["fr", "en"],
  publisher: { "@id": ID_ORGANISATION },
});

const application = (locale: Locale) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: NOM,
  alternateName: AUTRE_NOM,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Cross-platform",
  programmingLanguage: "Python",
  description: DESCRIPTION[locale],
  inLanguage: locale,
  url: `${ORIGINE}${lien("piighost", locale)}`,
  downloadUrl: PYPI,
  softwareHelp: docsPiighost(locale),
  softwareVersion: PIIGHOST_VERSION,
  license: MIT,
  author: auteur(),
  publisher: { "@id": ID_ORGANISATION },
  image: IMAGE,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
});

const codeSource = (locale: Locale) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: NOM,
  description: DESCRIPTION[locale],
  inLanguage: locale,
  url: `${ORIGINE}${lien("piighost", locale)}`,
  codeRepository: REPO,
  programmingLanguage: "Python",
  runtimePlatform: "Python 3",
  version: PIIGHOST_VERSION,
  license: MIT,
  author: auteur(),
});

/** Les projets autour de la bibliothèque, chacun sur sa page. */
type Projet = "api" | "chat" | "proofreader" | "caviardage";

/** Ce que chaque projet est, au sens de schema.org. Une licence n'est déclarée
 *  que là où le dépôt en publie une : piighost-proofreader n'en a pas, et
 *  caviardage est un dépôt privé. */
const PROJETS: Record<
  Projet,
  { categorie: string; systeme: string; licence?: string; langage?: string }
> = {
  api: {
    categorie: "DeveloperApplication",
    systeme: "Docker",
    licence: MIT,
    langage: "Python",
  },
  chat: {
    categorie: "CommunicationApplication",
    systeme: "Web browser",
    licence: MIT,
  },
  proofreader: { categorie: "BusinessApplication", systeme: "Web browser" },
  caviardage: { categorie: "BusinessApplication", systeme: "Web browser" },
};

const projet = (nom: Projet, locale: Locale) => {
  const p = getProject(nom);
  const quoi = PROJETS[nom];
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: p.name,
    applicationCategory: quoi.categorie,
    operatingSystem: quoi.systeme,
    ...(quoi.langage && { programmingLanguage: quoi.langage }),
    description: dictionaries[locale].seo.pages[nom],
    inLanguage: locale,
    url: `${ORIGINE}${lien(nom, locale)}`,
    ...(p.app && { installUrl: p.app }),
    ...(p.repo && { sameAs: [p.repo] }),
    ...(quoi.licence && { license: quoi.licence }),
    author: auteur(),
    publisher: { "@id": ID_ORGANISATION },
    isBasedOn: { "@type": "SoftwareApplication", name: NOM, url: REPO },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
};

const article = (locale: Locale) => {
  const t = dictionaries[locale];
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: t.philosophy.title,
    description: t.seo.philosophyDescription,
    inLanguage: locale,
    url: `${ORIGINE}${lien("philosophy", locale)}`,
    mainEntityOfPage: `${ORIGINE}${lien("philosophy", locale)}`,
    image: IMAGE,
    author: auteur(),
    publisher: { "@id": ID_ORGANISATION },
    about: { "@type": "Thing", name: "De-identification" },
  };
};

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

/** Le fil d'Ariane d'une page sous l'accueil, dans la langue de la page. */
const arianeDe = (nom: NomDePage, intitule: string, locale: Locale) =>
  filAriane([
    { name: ACCUEIL[locale], item: `${ORIGINE}${lien("home", locale)}` },
    { name: intitule, item: `${ORIGINE}${lien(nom, locale)}` },
  ]);

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
  inLanguage: locale,
  mainEntity: dictionaries[locale].faq.items.map((x) => ({
    "@type": "Question",
    name: x.question,
    acceptedAnswer: { "@type": "Answer", text: aplatir(x.answer) },
  })),
});

/** Ce qu'une page déclare. L'organisation et le site sont sur toutes, comme
 *  dans la mise en page du site actuel. */
export function donneesStructurees(nom: NomDePage, locale: Locale): object[] {
  const communes = [organisation(locale), siteWeb(locale)];
  switch (nom) {
    case "home":
      return [...communes, faq(locale)];
    case "piighost":
      return [
        ...communes,
        application(locale),
        codeSource(locale),
        arianeDe(nom, NOM, locale),
      ];
    case "philosophy":
      return [
        ...communes,
        article(locale),
        arianeDe(nom, dictionaries[locale].philosophy.title, locale),
      ];
    default:
      return [
        ...communes,
        projet(nom, locale),
        arianeDe(nom, getProject(nom).name, locale),
      ];
  }
}
