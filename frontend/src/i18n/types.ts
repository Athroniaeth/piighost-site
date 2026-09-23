export type Locale = "en" | "fr";

export type ProjectSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  ordered?: boolean;
  code?: string;
  afterCode?: string;
};

export type ProjectPageDict = {
  tagline: string;
  sections: ProjectSection[];
};

export type PhilosophyDict = {
  eyebrow: string;
  title: string;
  intro?: string;
  sections: Array<{
    id?: string;
    heading: string;
    paragraphs: string[];
    subsections?: Array<{
      heading: string;
      paragraphs: string[];
      list?: string[];
    }>;
    list?: string[];
    table?: { headers: string[]; rows: string[][] };
  }>;
};

/** A run of FAQ answer content: plain text, an inline code token, or a link. */
export type FaqSegment =
  string | { code: string } | { link: { href: string; text: string } };

export type Dictionary = {
  nav: {
    piighost: string;
    api: string;
    chat: string;
    proofreader: string;
    projects: string;
    philosophy: string;
    home: string;
    playground: string;
    docs: string;
    hub: string;
    github: string;
    toggleTheme: string;
    toggleLanguage: string;
    language: string;
    backToTop: string;
    mainNavigation: string;
  };
  projectHeader: {
    repository: string;
    docs: string;
    pypi: string;
    app: string;
  };
  projects: {
    piighost: ProjectPageDict;
    api: ProjectPageDict;
    chat: ProjectPageDict;
    proofreader: ProjectPageDict;
  };
  footer: {
    tagline: string;
    projects: string;
    links: string;
    mit: string;
  };
  hero: {
    /** Le nom en capitales de titre, ce que la charte prescrit hors prose. */
    name: string;
    /** Le slogan, coupé en deux pour que la seconde moitié porte la couleur. */
    sloganWork: string;
    sloganStay: string;
    description: string;
    getStarted: string;
    docs: string;
    worksWith: string;
    github: string;
  };
  problem: {
    eyebrow: string;
    title: string;
    /** Les quatre cartes de la version d'origine. Gardées pour
     *  components/landing/ProblemeCartes.svelte, qui n'est plus rendu. */
    items: Array<{ title: string; body: string }>;
    /** Le dilemme en tableau. Les verdicts, oui ou non, vivent dans le
     *  composant : ils ne dépendent pas de la langue, et les écrire deux fois
     *  les ferait dériver. Ici seulement les mots. */
    table: {
      columns: [string, string, string, string];
      rows: Array<{ label: string; cells: [string, string, string, string] }>;
      noteLead: string;
      note: string;
      /** Lus seulement par un lecteur d'écran : l'icône porte le verdict. */
      yes: string;
      partly: string;
      no: string;
      option: string;
    };
  };
  howItWorks: {
    eyebrow: string;
    title: string;
    lanes: { user: string; model: string; tools: string };
    /** `{ID}` et `{EMAIL}` sont remplis en valeurs ou en jetons. */
    messages: { send: string; sent: string; reply: string };
    note: string;
  };
  detector: {
    eyebrow: string;
    title: string;
    description: string;
    items: Array<{ title: string; body: string }>;
    supported: string;
  };
  ecosystem: {
    eyebrow: string;
    title: string;
    description: string;
    moreToCome: string;
    learnMore: string;
  };
  quickStart: {
    eyebrow: string;
    title: string;
    description: string;
  };
  cta: {
    title: string;
    description: string;
    readTheDocs: string;
    starOnGitHub: string;
  };
  faq: {
    heading: string;
    items: { question: string; answer: FaqSegment[] }[];
  };
  philosophy: PhilosophyDict;
  playground: {
    tabDetector: string;
    tabPipeline: string;
    tabsLabel: string;
    pipelineHeading: string;
    detectorHeading: string;
    configTitle: string;
    modelLabel: string;
    models: {
      multilingual: string;
      english: string;
      glinerSmall: string;
      glinerPii: string;
    };
    modelGroups: { classic: string; gliner: string };
    glinerLabelsLabel: string;
    labelSearchedPlaceholder: string;
    labelEmittedPlaceholder: string;
    labelAdd: string;
    labelEmittedHint: string;
    thresholdLabel: string;
    inputLabel: string;
    example: string;
    analyze: string;
    analyzing: string;
    loadingModel: string;
    firstLoadNote: string;
    edit: string;
    resultsTitle: string;
    inferenceTime: string;
    reqPerSecond: string;
    sortLabel: string;
    sortByAppearance: string;
    sortByScoreDesc: string;
    sortByScoreAsc: string;
    noEntities: string;
    columns: { text: string; label: string; score: string };
    errorTitle: string;
    retry: string;
    emptyHint: string;
    test: string;
    remove: string;
    moveUp: string;
    moveDown: string;
    detectorType: string;
    detectorTypes: {
      regex: string;
      transformers: string;
      gliner2: string;
      llm: string;
    };
    llmDeploymentNote: string;
    patternsLabel: string;
    patternsHint: string;
    pipelineNameLabel: string;
    emptyPipeline: string;
    exportTitle: string;
    exportToml: string;
    exportPython: string;
    downloadToml: string;
    tokenExample: string;
    saveDetector: string;
    detectorName: string;
    savedDetectors: string;
    examplesTitle: string;
    loadSampleText: string;
    noSaved: string;
    loadLabel: string;
    deleteLabel: string;
    editInPlayground: string;
    detectorsTitle: string;
    addFromSaved: string;
    spanResolverLabel: string;
    entityLinkerLabel: string;
    entityResolverLabel: string;
    anonymizerLabel: string;
    detectorsHelp: string;
    spanResolverHelp: string;
    entityLinkerHelp: string;
    entityResolverHelp: string;
    anonymizerHelp: string;
    liveTestTitle: string;
    anonymizedLabel: string;
    approximationNote: string;
    loadingRuntime: string;
    runtimeDownloading: string;
    runtimeInstalling: string;
    runtimeReady: string;
    noEnabledDetectors: string;
    staleNote: string;
    savePipeline: string;
    save: string;
    cancel: string;
    phHashLength: string;
    phMaskChar: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    philosophyDescription: string;
    pages: {
      piighost: string;
      api: string;
      chat: string;
      proofreader: string;
      playground: string;
      detector: string;
    };
  };
};
