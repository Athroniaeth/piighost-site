# piighost-site

Le site de présentation de [piighost](https://github.com/Athroniaeth/piighost),
servi sur `piighost.dev`. Six pages, deux langues, prérendues.

Il succède à [piighost-studio](https://github.com/Athroniaeth/piighost-studio),
dont il a d'abord été un portage à l'identique, reconstruit à partir de
[template-litestar-svelte](https://github.com/Athroniaeth/template-litestar-svelte).
Le playground n'y est plus : il est passé dans
[piighost-hub](https://hub.piighost.dev), et ce site présente le produit sans le
faire tourner. Le portage nu est gardé sous le tag `iso-studio`.

Par dessus, **l'identité visuelle de `piighost-identite` est appliquée**
(tokens, polices, couleurs de donnée, logo et icônes), puis chaque section de
la page d'accueil a été reprise une à une, sur planche, à partir de quatre
variantes : le bandeau, le problème en tableau, « pourquoi piighost »,
le fonctionnement en diagramme de séquence, l'écosystème, le démarrage rapide,
la FAQ et l'appel final.

L'ancien design reste consultable, figé, sur `v1.piighost.dev`.

Litestar 2.24, Svelte 5, Vite 8, Tailwind 4, nginx, OpenPanel auto hébergé.

## Ce qui rend ce site un peu différent d'une application Vite

**Il est prérendu.** Après le build, `frontend/prerender.mjs` rend chaque URL
avec le moteur serveur de Svelte et écrit un `index.html` complet, avec son
titre, sa description, son canonique et ses `hreflang`. Un robot qui n'exécute
aucun script voit donc douze pages, pas une coquille répétée douze fois. Le
dépôt `piighost-seo` mesure cette visibilité tous les jours, et la perdre se
verrait.

**La forme du site est écrite une seule fois**, dans `routes.json`. Trois
consommateurs la lisent : le routeur du frontend, le sitemap de Litestar, et le
prérendu. `frontend/src/lib/routes.ts` refuse de se charger si son union de
types et le fichier ont divergé, donc le build échoue plutôt que le site ne
perde une URL en silence.

Le prix de cette source unique : **les deux images doivent l'embarquer**, et
`Dockerfile.api` comme `Dockerfile.web` le copient explicitement. Oublier cette
ligne ne se voit pas en développement, seulement au démarrage du conteneur.

**Une URL inconnue renvoie un vrai 404.** nginx laisse `error_page` porter le
code ; répondre 200 sur une page d'erreur est un « soft 404 » que les index
classent comme un doublon de l'accueil.

## Structure

```
routes.json            la forme du site, lue par trois consommateurs
backend/               Litestar, sert /api, robots.txt et sitemap.xml
  seo.py               robots et sitemap, dérivés de routes.json
frontend/
  src/lib/             routeur, i18n, thème, tokens d'audience, en-têtes
  src/ui/              les composants de base, repris de piighost-design
  src/components/      la navigation, le pied de page, la démonstration
  src/pages/           les six pages
  src/i18n/            les dictionnaires, repris tels quels du studio
  src/app.css          les tokens du studio, repris tels quels
  src/studio.css       ce que Tailwind ne couvre pas : collage, coloration
  prerender.mjs        un HTML par URL, puis csp.conf, après le build
deploy/                nginx : arbre prérendu, /api, /api/op, en-têtes
```

## Installation

```bash
uv sync
cd frontend && pnpm install
cp .env.example .env     # et renseigner API_KEY
```

## Développement

```bash
just dev                 # API et Vite ensemble
uv run pytest            # les tests du backend
cd frontend && pnpm build   # build, prérendu et vérification des types
```

## Ce que le portage a dû changer, et pourquoi

Tout le reste est repris tel quel. Ces quatre écarts sont imposés par la pile,
pas par le goût, et chacun est commenté à son emplacement.

| Écart | Raison |
|---|---|
| Polices servies par fontsource au lieu de `next/font` | il n'y a plus de Next. Ce sont les mêmes, Geist et Geist Mono, auto hébergées. |
| Coloration syntaxique en classes, pas par shiki | shiki émet des styles en ligne, que la CSP `style-src 'self'` refuse. La tokenisation vit dans `src/lib/highlight.ts`, les couleurs sont celles de github-light et github-dark. |
| `radial-gradient` du bandeau écrit en `color-mix` | le studio l'écrit `var(--primary)/12%`, qui n'est pas une couleur CSS valide et ne peignait donc rien. |
| Pied de page : « construit avec Svelte » | la ligne nommait Next.js. La pile a changé, la phrase serait fausse. |

## L'identité visuelle ne se modifie pas ici

`frontend/src/app.css` est **généré**. Sa source est
`piighost-identite/brand/tokens/tokens.json`, et sa production est vérifiée :
44 paires de contraste du socle et 32 paires d'entités sont contrôlées à chaque
génération, et le générateur refuse d'écrire si une seule échoue.

```bash
node brand/outils/tokens.mjs
cp brand/tokens/cibles/studio-app.css <ici>/frontend/src/app.css
python3 brand/outils/rasteriser.py      # les icônes et le .ico
```

Trois règles de la charte se voient dans le code de ce dépôt :

- **la teinte dit la catégorie, l'intensité dit l'état.** `src/lib/entites.ts`
  associe une teinte à chaque catégorie, `src/lib/labels.ts` compose le nom de
  classe. L'ambre que le site employait pour la donnée brute disait l'état,
  donc l'inverse du playground, où la même couleur veut dire `ORG` ;
- **le corail n'apparaît sur aucune surface qui affiche de la donnée.** La
  seule page du site qui n'en affiche aucune est la 404, et c'est la seule où
  le fantôme est corail. Ailleurs il est en `currentColor` ;
- **aucune teinte brute hors de la couche de tokens.** Y compris la coloration
  syntaxique, qui prend les pastilles d'entités.

Les règles d'usage sont dans `piighost-identite/brand/charte/CHARTE.md`.

## Les données structurées et la politique de sécurité

Les blocs schema.org sont écrits par le prérendu, pas par un composant : leur
contenu est fixe par route, et un composant les rejouerait à l'hydratation sur
une page déjà servie complète.

Conséquence sur la CSP : un bloc `application/ld+json` **est** un élément
`script`, donc `script-src 'self'` le refuse. Le prérendu calcule l'empreinte
sha256 de chaque bloc et écrit `frontend/csp.conf`, que
`deploy/security-headers.conf` inclut et que `Dockerfile.web` copie dans
l'image. Le fichier n'est pas versionné : il change avec la copie du site.

## La mesure d'audience

OpenPanel, auto hébergé. Le SDK est empaqueté depuis npm et non chargé depuis
un CDN, et les événements partent vers `/api/op`, que nginx relaie. Deux
conséquences : la politique de sécurité reste `script-src 'self'; connect-src
'self'`, et un bloqueur de publicité n'a aucun domaine à reconnaître, donc les
chiffres ne manquent pas silencieusement d'une part des visiteurs.

**L'enregistrement de session est désactivé explicitement**, dans
`frontend/src/lib/analytics.ts`. Un produit dont l'argument est que les données
ne sortent pas ne filme pas l'écran de ses visiteurs. Le jeu d'événements est
fermé et typé : aucune propriété ne peut transporter un texte saisi.
