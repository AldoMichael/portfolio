# Portfolio — Aldo Michael Firmin Randriantsoamanitra

Portfolio personnel one-page d'un développeur web full stack : thème sombre premium, animations
Framer Motion au scroll, fond animé en Canvas, curseur magnétique — et un back-office maison qui
permet de modifier le contenu depuis le navigateur, sans toucher au code.

**Front :** React 18 · Vite · TypeScript · Tailwind CSS · Framer Motion · lucide-react
**Back :** NestJS · TypeORM · PostgreSQL · JWT

![Aperçu du portfolio](docs/preview-desktop.png)

---

## 🚀 Démarrage rapide

### Le site seul (sans base de données)

```bash
npm install     # installation des dépendances
npm run dev     # serveur de développement -> http://localhost:5173
```

Le portfolio fonctionne tel quel : si l'API n'est pas démarrée, il affiche le contenu statique de
`src/data/portfolio.ts`. C'est le mode à utiliser pour un déploiement 100 % statique.

### Le site + le back-office

```bash
# 1. base de données (une seule fois)
createdb -U postgres portfolio

# 2. API
cd server
npm install
cp .env.example .env      # puis renseignez DB_PASSWORD, JWT_SECRET et ADMIN_PASSWORD
npm run seed              # crée les tables, insère le contenu et le compte admin
npm run dev               # API -> http://localhost:3001/api

# 3. site (dans un autre terminal, à la racine)
npm run dev               # -> http://localhost:5173
```

L'administration est ensuite accessible sur **http://localhost:5173/admin**.

Autres commandes :

| Commande            | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| `npm run build`     | Vérifie les types puis génère la version de production (`dist`) |
| `npm run preview`   | Sert localement le build de production                          |
| `npm run typecheck` | Vérification TypeScript seule                                   |
| `npm run cv`        | Régénère le CV PDF dans `/public` à partir du script            |

---

## ✏️ Modifier le contenu

Le contenu se répartit sur **deux niveaux**.

### 1. Depuis le back-office (`/admin`) — contenu vivant

Ces sections sont stockées en base PostgreSQL et se modifient dans le navigateur, sans redéployer :

| Section dans l'admin  | Ce qu'elle pilote sur le site                        |
| --------------------- | ---------------------------------------------------- |
| Parcours              | La timeline « Expérience »                           |
| Technologies          | Les groupes de compétences et leurs badges           |
| Statistiques          | Les chiffres clés animés de « À propos »             |
| Applications métier   | Les cartes de projets freelance                      |
| Formation             | Les diplômes de la section « Parcours »              |
| Langues               | Les barres de progression de niveau                  |
| Réglages              | Années d'expérience, accroche du Hero, disponibilité |

Chaque liste se réordonne avec les flèches ↑ ↓ ; l'ordre est enregistré en base.

#### Liens et démos

Le **Parcours** et les **Applications métier** disposent de deux champs de lien facultatifs :

| Champ                    | Effet sur la carte du site                                                    |
| ------------------------ | ----------------------------------------------------------------------------- |
| `Lien de l'application`  | Rend la carte **entièrement cliquable** et affiche une flèche au survol        |
| `Lien de la démo`        | Affiche un bouton « Voir la démo » qui reste cliquable indépendamment          |

Les deux s'ouvrent dans un nouvel onglet. Une carte sans lien reste simplement non cliquable,
sans flèche ni bouton. Seules les URLs en `http://`, `https://` ou commençant par `/` sont
acceptées : l'API rejette le reste (notamment `javascript:`) avec une erreur 400.

### 2. Dans `src/data/portfolio.ts` — identité et structure

Ce fichier reste la source des éléments qui changent rarement, **et sert de contenu de repli si
l'API est injoignable** :

| Ce que vous voulez changer     | Où, dans `src/data/portfolio.ts`                        |
| ------------------------------ | ------------------------------------------------------- |
| Nom, titres animés             | `profile`                                               |
| Téléphone, email, localisation | `profile.phone`, `profile.email`, `profile.location`    |
| Lien du CV téléchargeable      | `profile.cvUrl`                                         |
| Textes de la section « À propos » | `about.heading`, `about.paragraphs`                  |
| LinkedIn / GitHub              | `socials` — **remplacez les `#` par vos vraies URLs**    |
| Entrées du menu                | `navItems` (l'`id` doit correspondre à l'id de section) |
| Palette de couleurs d'accent   | `accentPresets`                                         |

### Remplacer le CV PDF

Le fichier `public/cv-aldo-randriantsoamanitra.pdf` est généré par
`scripts/generate-cv-pdf.mjs` (aucune dépendance externe). Deux options :

1. **Remplacer le fichier** dans `public/` par votre propre PDF (conservez le même nom, ou
   mettez à jour `profile.cvUrl`).
2. **Modifier le script** puis lancer `npm run cv` pour régénérer le PDF.

### Changer la couleur d'accent

L'accent est une variable CSS (`--accent`) définie dans `src/index.css` et modifiable :

- **à chaud** depuis le site, via l'icône palette dans la navbar (choix mémorisé dans le
  `localStorage`) ;
- **par défaut**, en changeant l'ordre de `accentPresets` dans `src/data/portfolio.ts` ou la
  valeur `--accent` dans `src/index.css` (format `R G B` sans virgules).

---

## 🗄 Back-office & API

### Configuration (`server/.env`)

| Variable                    | Rôle                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| `DB_HOST` / `DB_PORT`       | Serveur PostgreSQL (par défaut `localhost:5432`)                    |
| `DB_USER` / `DB_PASSWORD`   | Identifiants PostgreSQL                                             |
| `DB_NAME`                   | Nom de la base (par défaut `portfolio`)                             |
| `DB_SYNCHRONIZE`            | `true` en dev : TypeORM crée et met à jour les tables tout seul      |
| `JWT_SECRET`                | Clé de signature des jetons — **obligatoire**, l'API refuse de démarrer sans |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Compte créé ou mis à jour par `npm run seed`                   |
| `CORS_ORIGIN`               | Origines autorisées à appeler l'API, séparées par des virgules       |

Générer une clé JWT solide :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Commandes du serveur

| Commande                  | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| `npm run dev`             | API en rechargement automatique sur le port 3001            |
| `npm run seed`            | Peuple les tables **vides** et crée le compte administrateur |
| `npm run seed -- --reset` | Vide les tables de contenu puis réinsère les données d'origine |
| `npm run build`           | Compile vers `dist/`                                        |
| `npm start`               | Lance la version compilée                                   |

### Routes

| Méthode  | Route                             | Accès  |
| -------- | --------------------------------- | ------ |
| `GET`    | `/api/content`                    | Public |
| `GET`    | `/api/schema`                     | Public |
| `POST`   | `/api/auth/login`                 | Public |
| `GET`    | `/api/admin/:resource`            | JWT    |
| `POST`   | `/api/admin/:resource`            | JWT    |
| `PATCH`  | `/api/admin/:resource/:id`        | JWT    |
| `DELETE` | `/api/admin/:resource/:id`        | JWT    |
| `PUT`    | `/api/admin/:resource/reorder`    | JWT    |

`GET /api/content` renvoie l'intégralité du contenu en un seul appel : le portfolio n'a donc
qu'une requête à faire au chargement.

### Ajouter un champ éditable

Le formulaire d'administration est **généré à partir du schéma serveur**. Pour ajouter un champ :

1. ajoutez la colonne dans `server/src/content/entities.ts` ;
2. déclarez le champ dans `server/src/content/schema.ts`.

Il apparaît automatiquement dans `/admin`, aucun code d'interface à écrire.

### Sécurité

- Mots de passe hachés avec **scrypt** (module `crypto` natif), jamais stockés en clair.
- Routes d'écriture protégées par JWT ; les tentatives de connexion sont limitées à 8 par
  tranche de 10 minutes et par adresse IP.
- Les données reçues sont filtrées champ par champ d'après le schéma : rien d'autre n'est écrit
  en base.

---

## 🗂 Structure du projet

```
.
├── public/
│   ├── cv-aldo-randriantsoamanitra.pdf   # CV téléchargeable
│   └── favicon.svg
├── scripts/
│   └── generate-cv-pdf.mjs               # génération du CV PDF
├── server/                               # API CMS (NestJS + PostgreSQL)
│   ├── src/
│   │   ├── auth/                         # connexion admin, JWT, hachage scrypt
│   │   ├── content/
│   │   │   ├── entities.ts               # tables PostgreSQL
│   │   │   ├── schema.ts                 # ✅ champs éditables (pilote les formulaires)
│   │   │   ├── content.service.ts        # lecture publique + CRUD générique
│   │   │   └── content.controller.ts     # routes /api
│   │   ├── seed-data.ts                  # contenu initial
│   │   ├── seed.ts                       # script de peuplement
│   │   └── main.ts
│   └── .env.example
├── src/
│   ├── admin/                            # back-office (chargé uniquement sur /admin)
│   │   ├── AdminApp.tsx                  # connexion + tableau de bord
│   │   ├── ResourceEditor.tsx            # liste, formulaire et réordonnancement
│   │   └── types.ts                      # conversions formulaire <-> API
│   ├── context/
│   │   └── ContentContext.tsx            # contenu API avec repli statique
│   ├── components/                       # briques réutilisables
│   │   ├── AnimatedBackground.tsx        # particules Canvas + halos animés
│   │   ├── BackToTop.tsx                 # bouton flottant retour en haut
│   │   ├── Counter.tsx                   # compteur animé
│   │   ├── CustomCursor.tsx              # curseur personnalisé (desktop)
│   │   ├── Footer.tsx
│   │   ├── Loader.tsx                    # écran de chargement d'entrée
│   │   ├── Magnetic.tsx                  # effet magnétique sur les boutons
│   │   ├── Navbar.tsx                    # nav sticky + burger + palette
│   │   ├── Reveal.tsx                    # apparition au scroll générique
│   │   ├── ScrollProgress.tsx            # barre de progression de lecture
│   │   ├── Section.tsx                   # <Section> réutilisable (whileInView)
│   │   ├── TiltCard.tsx                  # carte 3D + halo au survol
│   │   └── Typewriter.tsx                # effet machine à écrire
│   ├── data/
│   │   └── portfolio.ts                  # ✅ TOUT LE CONTENU EST ICI
│   ├── hooks/
│   │   ├── useAccent.ts                  # couleur d'accent + localStorage
│   │   ├── useActiveSection.ts           # section active (IntersectionObserver)
│   │   └── useScrolled.ts                # état de défilement
│   ├── lib/
│   │   ├── api.ts                        # client HTTP + jeton d'administration
│   │   └── motion.ts                     # variantes Framer Motion partagées
│   ├── sections/                         # les sections de la page
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Skills.tsx
│   │   ├── Experience.tsx
│   │   ├── Projects.tsx
│   │   ├── Journey.tsx                   # formation + langues
│   │   └── Contact.tsx
│   ├── App.tsx
│   ├── index.css                         # base Tailwind + variables + utilitaires
│   └── main.tsx
├── index.html
├── tailwind.config.js
├── vite.config.ts
├── vercel.json
└── netlify.toml
```

---

## ✉️ Formulaire de contact

Par défaut, le formulaire valide les champs en temps réel puis ouvre le client mail de
l'utilisateur (`mailto:`) avec un message pré-rempli — aucun back-end n'est nécessaire.

**Pour un envoi direct depuis le site avec [EmailJS](https://www.emailjs.com/) :**

```bash
npm install @emailjs/browser
```

Créez un fichier `.env` à la racine :

```env
VITE_EMAILJS_SERVICE_ID=service_xxx
VITE_EMAILJS_TEMPLATE_ID=template_xxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxx
```

Puis, dans `src/sections/Contact.tsx`, remplacez le corps de `handleSubmit` par :

```ts
import emailjs from '@emailjs/browser'

await emailjs.send(
  import.meta.env.VITE_EMAILJS_SERVICE_ID,
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  { from_name: values.name, from_email: values.email, subject: values.subject, message: values.message },
  { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY },
)
setSent(true)
```

---

## ♿ Accessibilité & performances

- **`prefers-reduced-motion`** : toutes les animations (Framer Motion, Canvas, CSS) sont
  désactivées si l'utilisateur a demandé une réduction des animations.
- Le fond Canvas se met en pause quand l'onglet n'est pas visible et adapte sa densité de
  particules à la taille de l'écran.
- Les images éventuelles doivent être ajoutées avec `loading="lazy"` et `decoding="async"`.
- Navigation au clavier : anneaux de focus visibles, libellés `aria-label` sur les boutons
  icônes, `role="progressbar"` sur les barres de niveau.
- Les librairies lourdes (React, Framer Motion) sont isolées dans des chunks séparés pour un
  meilleur cache navigateur.

---

## ☁️ Déploiement

### Vercel

```bash
npm i -g vercel
vercel          # environnement de préproduction
vercel --prod   # production
```

La configuration (`vercel.json`) est déjà présente : build `npm run build`, sortie `dist`.

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --build          # préproduction
netlify deploy --build --prod   # production
```

Le fichier `netlify.toml` définit la commande de build, le dossier publié et la redirection SPA.

### Hébergement statique classique

`npm run build` génère un dossier `dist/` entièrement statique, déployable sur n'importe quel
hébergeur (GitHub Pages, OVH, Firebase Hosting…).

### Déployer aussi l'API

Le front et l'API se déploient séparément :

1. Hébergez `server/` sur une plateforme Node avec PostgreSQL managé (Railway, Render, Fly.io,
   Scaleway…) et renseignez-y les variables de `server/.env.example`.
2. Passez `DB_SYNCHRONIZE=false` en production et générez des migrations TypeORM.
3. Ajoutez l'URL publique du site dans `CORS_ORIGIN`.
4. Côté front, définissez la variable d'environnement `VITE_API_URL` avec l'URL de l'API, puis
   relancez le build.

Sans `VITE_API_URL`, ou si l'API ne répond pas, le site affiche le contenu de
`src/data/portfolio.ts` : le déploiement statique reste donc toujours valable.

---

## 📄 Licence

Projet personnel — contenu et CV appartenant à Aldo Michael Firmin Randriantsoamanitra.
