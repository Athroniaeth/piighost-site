/**
 * Deux langues, un dictionnaire, aucune dépendance.
 *
 * La langue vient de l'URL, pas d'un stockage local : `/fr/...` et `/en/...`
 * sont deux pages indexables, et `hreflang` peut dire la vérité.
 *
 * Règles d'écriture, reprises de brand/charte/CHARTE.md §8 :
 *   on décrit, on ne promet pas ; la limite avant l'argument ; le chiffre
 *   plutôt que l'adjectif ; jamais la peur ; pas de jeu de mots intraduisible ;
 *   pas de tiret cadratin.
 *
 * Une clé absente retombe sur l'anglais plutôt que d'afficher la clé.
 */

import { router } from "./router.svelte";
import type { Locale } from "./routes";

const STRINGS = {
  en: {
    "nav.home": "Home",
    "nav.projects": "Projects",
    "nav.philosophy": "Philosophy",
    "nav.docs": "Documentation",
    "nav.github": "GitHub",
    "nav.theme": "Toggle theme",
    "nav.language": "Change language",
    "nav.skip": "Skip to content",
    "nav.menu": "Menu",

    "home.title": "Use an LLM without handing it your confidential data",
    "home.lede":
      "piighost replaces every sensitive value with a stable placeholder before the text leaves your process. The model reasons on placeholders, your tools receive the real values, and the reply comes back in clear. Your agent code does not change.",
    "home.cta.start": "Read the documentation",
    "home.cta.github": "GitHub",
    "home.demo.before": "what you write",
    "home.demo.after": "what the model receives",
    // {0} à {3} sont remplacés par les valeurs mises en couleur. La phrase est
    // traduite en entier, pas assemblée de morceaux : une langue n'ordonne pas
    // ses compléments comme l'autre.
    "home.demo.sentence": "Hello, this is {0} from {1}. My order {2} should be delivered to {3}.",

    "meca.band": "the mechanism",
    "meca.1": "Detect",
    "meca.2": "Substitute",
    "meca.3": "Restore",
    "meca.1.note": "Eight detector families ship with the library, and you keep the one you trust. Presidio plugs in through an extra.",
    "meca.2.note": "The same value keeps the same placeholder for the whole thread, so the model can follow who is who. Three memory backends hold the mapping: in-process, Redis, SQLAlchemy.",
    "meca.3.note": "The tool receives the real value while the model only ever wrote the placeholder.",
    "meca.2.of": "becomes",
    "meca.3.of": "comes back as",

    "integ.band": "integrations",
    "integ.note": "Six integrations, two of them proxies you point an existing client at. Your agent code does not change: the middleware sits between it and the model.",

    "eco.band": "the ecosystem",
    "philosophy.band": "three reasons",
    "project.band": "the facts",
    "project.licence": "Licence",
    "project.site": "Site",
    "limit.band": "what it is not",
    "limit.see": "For dataset anonymisation, look at ARX, Amnesia or Google DLP.",

    "home.how.kicker": "How it works",
    "home.how.title": "Detect, substitute, restore",
    "home.how.lede":
      "Three stages, and a placeholder that does not move for the length of a conversation.",
    "home.how.1.title": "Detect",
    "home.how.1.body":
      "Pluggable detectors: regex catalogues for generic, US, EU and FR patterns, NER through GLiNER2, spaCy or Transformers, an LLM detector, plus exact-match, composite and chunked detectors. Presidio plugs in through an extra.",
    "home.how.2.title": "Substitute",
    "home.how.2.body":
      "Each value becomes a stable id such as <<PERSON:1>>. The same value keeps the same id for the whole thread, so the model can follow who is who. Label-only, masked and keyed-hash factories exist too.",
    "home.how.3.title": "Restore",
    "home.how.3.body":
      "Placeholders are put back automatically. The end user reads john.doe@example.com and never sees an id. With the LangChain middleware, a tool that needs the real address gets it while the model only ever wrote the placeholder.",

    "home.limit.kicker": "What it is not",
    "home.limit.title": "Pseudonymisation, not anonymisation",
    "home.limit.body":
      "The mapping is kept so the reply can be restored, which makes this pseudonymisation under the GDPR. Real values stay stored for the length of the conversation and the store must be protected accordingly. piighost gives you the means: AES-GCM on the values, Argon2id on the keys. It does not anonymise datasets, and it does no k-anonymity or differential privacy. For that, look at ARX or Amnesia.",

    "home.eco.kicker": "The ecosystem",
    "home.eco.title": "One library, and what runs on it",
    "home.eco.lede": "Every piece is open source under MIT and self-hostable.",

    "home.trust.1": "MIT licence",
    "home.trust.2": "Typed, ships py.typed",
    "home.trust.3": "OpenTelemetry spans per stage",
    "home.trust.4": "Self-hostable, nothing phones home",

    "philosophy.title": "Why this exists",
    "philosophy.lede":
      "A confidentiality promise that rests on a contract is not a guarantee, it is a signature. A data processing agreement is read; it is not verified. Code is.",
    "philosophy.1.title": "Most tooling stops at detection",
    "philosophy.1.body":
      "Presidio, GLiNER, spaCy and regex catalogues all find entities in text, and they do it well. The hard part for an agent is everything after: swapping values without wrecking the model's reasoning, keeping one value mapped to one placeholder across a conversation, handing tools the real value while the model sees only the placeholder, and putting the originals back in the reply. That orchestration is what piighost is.",
    "philosophy.2.title": "The placeholder carries nothing",
    "philosophy.2.body":
      "A format-preserving token is its own ciphertext, so it can be captured today and cracked in twenty years. An id reveals nothing on its own. The price is a cache holding the mapping, which you then have to deploy, share across workers and protect. That trade is stated here rather than hidden.",
    "philosophy.3.title": "Live text, not datasets",
    "philosophy.3.body":
      "piighost protects a running conversation message by message. It is not a dataset anonymiser, and saying so up front is cheaper for everyone than discovering it in week three.",

    "project.piighost.title": "piighost",
    // Le titre d'onglet ne peut pas être « piighost | piighost ». Une page dont
    // le nom est celui du produit a besoin de dire ce qu'elle est.
    "project.piighost.titreOnglet": "piighost, the Python library",
    "project.piighost.lede":
      "The Python library. Detection, substitution, restoration, and the pipeline that holds them together.",
    "project.api.title": "piighost-api",
    "project.api.lede":
      "The same pipeline behind an HTTP service, with OpenAI-compatible and Anthropic-compatible proxies. Point your existing client at it and change nothing else.",
    "project.chat.title": "piighost-chat",
    "project.chat.lede":
      "A chat where you can watch the substitution happen. What you type, what the model receives, and what comes back.",
    "project.proofreader.title": "piighost-proofreader",
    "project.proofreader.lede":
      "Paste a document, see what a detector finds in it, and read the de-identified version side by side.",

    "project.repo": "Repository",
    "project.open": "Open",
    "project.install": "Install",
    "project.copied": "Copied",

    "404.title": "This page does not exist",
    "404.body": "The link may be old, or the address mistyped.",
    "404.back": "Back to the home page",

    "footer.rights": "MIT licence",
    "footer.built": "Built with piighost",
  },

  fr: {
    "nav.home": "Accueil",
    "nav.projects": "Projets",
    "nav.philosophy": "Philosophie",
    "nav.docs": "Documentation",
    "nav.github": "GitHub",
    "nav.theme": "Changer de thème",
    "nav.language": "Changer de langue",
    "nav.skip": "Aller au contenu",
    "nav.menu": "Menu",

    "home.title": "Utilisez un LLM sans lui donner vos données confidentielles",
    "home.lede":
      "piighost remplace chaque valeur sensible par un jeton stable avant que le texte ne quitte votre processus. Le modèle raisonne sur les jetons, vos outils reçoivent les vraies valeurs, et la réponse revient en clair. Votre code d'agent ne change pas.",
    "home.cta.start": "Lire la documentation",
    "home.cta.github": "GitHub",
    "home.demo.before": "ce que vous écrivez",
    "home.demo.after": "ce que le modèle reçoit",
    "home.demo.sentence":
      "Bonjour, ici {0} de {1}. Ma commande {2} doit être livrée au {3}.",

    "meca.band": "le mécanisme",
    "meca.1": "Détecter",
    "meca.2": "Substituer",
    "meca.3": "Rendre",
    "meca.1.note": "Huit familles de détecteurs sont livrées, et vous gardez celui en qui vous avez confiance. Presidio se branche par une option.",
    "meca.2.note": "La même valeur garde le même jeton sur tout le fil, donc le modèle sait qui est qui. Trois mémoires gardent la correspondance : en processus, Redis, SQLAlchemy.",
    "meca.3.note": "L'outil reçoit la vraie valeur alors que le modèle n'a jamais écrit que le jeton.",
    "meca.2.of": "devient",
    "meca.3.of": "revient en",

    "integ.band": "intégrations",
    "integ.note": "Six intégrations, dont deux proxys sur lesquels pointer un client existant. Votre code d'agent ne change pas : l'intercepteur se place entre lui et le modèle.",

    "eco.band": "l'écosystème",
    "philosophy.band": "trois raisons",
    "project.band": "les faits",
    "project.licence": "Licence",
    "project.site": "Site",
    "limit.band": "ce que ce n'est pas",
    "limit.see": "Pour anonymiser un jeu de données, regardez ARX, Amnesia ou Google DLP.",

    "home.how.kicker": "Comment ça marche",
    "home.how.title": "Détecter, substituer, rendre",
    "home.how.lede":
      "Trois étapes, et un jeton qui ne bouge pas sur toute la durée d'une conversation.",
    "home.how.1.title": "Détecter",
    "home.how.1.body":
      "Des détecteurs enfichables : catalogues d'expressions régulières génériques, américaines, européennes et françaises, reconnaissance d'entités par GLiNER2, spaCy ou Transformers, un détecteur par LLM, plus les détecteurs exacts, composites et par tronçons. Presidio se branche par une option.",
    "home.how.2.title": "Substituer",
    "home.how.2.body":
      "Chaque valeur devient un identifiant stable du type <<PERSON:1>>. La même valeur garde le même identifiant sur tout le fil, donc le modèle sait qui est qui. Des fabriques par étiquette seule, par masquage ou par empreinte à clé existent aussi.",
    "home.how.3.title": "Rendre",
    "home.how.3.body":
      "Les jetons sont remis en place automatiquement. L'utilisateur lit john.doe@example.com et ne voit jamais d'identifiant. Avec l'intercepteur LangChain, un outil qui a besoin de la vraie adresse la reçoit, alors que le modèle n'a jamais écrit que le jeton.",

    "home.limit.kicker": "Ce que ce n'est pas",
    "home.limit.title": "Une pseudonymisation, pas une anonymisation",
    "home.limit.body":
      "La correspondance est conservée pour pouvoir restituer la réponse, ce qui en fait une pseudonymisation au sens du RGPD. Les vraies valeurs restent stockées le temps de la conversation, et ce stockage doit être protégé en conséquence. piighost vous en donne les moyens : AES-GCM sur les valeurs, Argon2id sur les clés. Il n'anonymise pas un jeu de données et ne fait ni k-anonymat ni confidentialité différentielle.",

    "home.eco.kicker": "L'écosystème",
    "home.eco.title": "Une bibliothèque, et ce qui tourne dessus",
    "home.eco.lede": "Chaque pièce est libre sous licence MIT et auto hébergeable.",

    "home.trust.1": "Licence MIT",
    "home.trust.2": "Typé, livre py.typed",
    "home.trust.3": "Traces OpenTelemetry par étape",
    "home.trust.4": "Auto hébergeable, rien ne remonte",

    "philosophy.title": "Pourquoi ça existe",
    "philosophy.lede":
      "Une promesse de confidentialité qui repose sur un contrat n'est pas une garantie, c'est une signature. Un accord de traitement se lit, il ne se vérifie pas. Le code, si.",
    "philosophy.1.title": "La plupart des outils s'arrêtent à la détection",
    "philosophy.1.body":
      "Presidio, GLiNER, spaCy et les catalogues d'expressions régulières trouvent tous des entités dans un texte, et ils le font bien. Le difficile, pour un agent, est tout ce qui vient après : remplacer les valeurs sans casser le raisonnement du modèle, garder une valeur associée à un jeton sur toute une conversation, donner la vraie valeur à l'outil alors que le modèle ne voit que le jeton, et remettre les originaux dans la réponse. Cette orchestration est ce qu'est piighost.",
    "philosophy.2.title": "Le jeton ne transporte rien",
    "philosophy.2.body":
      "Un jeton à format préservé est son propre chiffré : il peut être capturé aujourd'hui et cassé dans vingt ans. Un identifiant ne révèle rien par lui même. Le prix est un cache qui garde la correspondance, qu'il faut ensuite déployer, partager entre processus et protéger. Cet arbitrage est énoncé ici plutôt que caché.",
    "philosophy.3.title": "Du texte vivant, pas des jeux de données",
    "philosophy.3.body":
      "piighost protège une conversation en cours, message par message. Ce n'est pas un anonymiseur de jeux de données, et le dire tout de suite coûte moins cher à tout le monde que de le découvrir la troisième semaine.",

    "project.piighost.title": "piighost",
    // Le titre d'onglet ne peut pas être « piighost | piighost ». Une page dont
    // le nom est celui du produit a besoin de dire ce qu'elle est.
    "project.piighost.titreOnglet": "piighost, la bibliothèque Python",
    "project.piighost.lede":
      "La bibliothèque Python. Détection, substitution, restitution, et le pipeline qui les tient ensemble.",
    "project.api.title": "piighost-api",
    "project.api.lede":
      "Le même pipeline derrière un service HTTP, avec des proxys compatibles OpenAI et Anthropic. Pointez votre client existant dessus et ne changez rien d'autre.",
    "project.chat.title": "piighost-chat",
    "project.chat.lede":
      "Une conversation où l'on voit la substitution se faire. Ce que vous tapez, ce que le modèle reçoit, et ce qui revient.",
    "project.proofreader.title": "piighost-proofreader",
    "project.proofreader.lede":
      "Collez un document, voyez ce qu'un détecteur y trouve, et lisez la version désidentifiée côte à côte.",

    "project.repo": "Dépôt",
    "project.open": "Ouvrir",
    "project.install": "Installer",
    "project.copied": "Copié",

    "404.title": "Cette page n'existe pas",
    "404.body": "Le lien est peut-être ancien, ou l'adresse mal saisie.",
    "404.back": "Revenir à l'accueil",

    "footer.rights": "Licence MIT",
    "footer.built": "Fait avec piighost",
  },
} as const;

export type Cle = keyof (typeof STRINGS)["en"];

/** Les tables sont `as const`, donc littérales : les indexer par une clé
 *  calculée demande de les voir comme des enregistrements complets. */
type Table = Record<Cle, string>;

/** La chaîne dans la langue courante, avec repli sur l'anglais. */
export function t(cle: Cle): string {
  return tr(router.locale as Locale, cle);
}

/** La même, hors composant, pour le prérendu et les balises d'en-tête. */
export function tr(locale: Locale, cle: Cle): string {
  const table = STRINGS[locale] as unknown as Table | undefined;
  return table?.[cle] ?? (STRINGS.en as unknown as Table)[cle] ?? cle;
}

/** Les clés d'un projet, sans construire une chaîne que le type ne voit pas.
 *
 *  `t(\`project.\${slug}.title\`)` compilerait en `string`, donc une faute de
 *  frappe passerait. Ce helper garde l'union. */
export function tProjet(
  slug: "piighost" | "api" | "chat" | "proofreader",
  champ: "title" | "lede",
): string {
  const cles = {
    piighost: { title: "project.piighost.title", lede: "project.piighost.lede" },
    api: { title: "project.api.title", lede: "project.api.lede" },
    chat: { title: "project.chat.title", lede: "project.chat.lede" },
    proofreader: { title: "project.proofreader.title", lede: "project.proofreader.lede" },
  } as const;
  return t(cles[slug][champ]);
}

export { STRINGS };
