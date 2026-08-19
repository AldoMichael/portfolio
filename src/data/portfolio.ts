/**
 * ============================================================================
 *  CONTENU DU PORTFOLIO
 * ----------------------------------------------------------------------------
 *  Tout le contenu éditorial du site est centralisé ici.
 *  Pour mettre à jour le portfolio (texte, expériences, projets, liens...),
 *  il suffit de modifier ce fichier : aucun composant n'a besoin d'être touché.
 * ============================================================================
 */

/* ----------------------------------- Types --------------------------------- */

export type NavItem = {
  id: string
  label: string
}

export type SkillGroup = {
  title: string
  description: string
  /** Nom d'icône Lucide (voir src/components/Icon.tsx pour la correspondance) */
  icon: 'code' | 'server' | 'database' | 'shield'
  items: string[]
}

export type ExperienceItem = {
  period: string
  role: string
  company: string
  location: string
  /** Mis en avant visuellement (poste le plus récent / le plus significatif) */
  current?: boolean
  tasks: string[]
  tags?: string[]
  /** Lien vers l'application ou le site : rend la carte cliquable */
  url?: string
  /** Lien vers une démonstration : affiche un bouton dédié */
  demoUrl?: string
}

export type ProjectItem = {
  title: string
  client: string
  location: string
  date: string
  summary: string
  highlights: string[]
  tags: string[]
  /** Lien vers l'application ou le site : rend la carte cliquable */
  url?: string
  /** Lien vers une démonstration : affiche un bouton dédié */
  demoUrl?: string
}

export type EducationItem = {
  degree: string
  school: string
  year: string
  detail?: string
}

export type LanguageItem = {
  name: string
  level: string
  /** Niveau en pourcentage, utilisé pour la barre de progression animée */
  value: number
}

export type SocialLink = {
  label: string
  href: string
  icon: 'linkedin' | 'github' | 'mail' | 'phone'
}

export type StatItem = {
  /** Valeur numérique animée par le compteur */
  value: number
  /** Suffixe accolé au nombre, ex. « + » */
  suffix: string
  label: string
}

/* ---------------------------------- Profil --------------------------------- */

export const profile = {
  firstName: 'Aldo Michael Firmin',
  lastName: 'Randriantsoamanitra',
  fullName: 'Aldo Michael Firmin Randriantsoamanitra',
  initials: 'AR',
  /** Titres qui défilent en animation « machine à écrire » dans le Hero */
  titles: ['Développeur Web', 'Développeur Full Stack'],
  tagline:
    "Plus de 5 ans d'expérience en développement d'applications web, support ERP, développement backend / frontend et gestion de bases de données.",
  location: 'Madagascar',
  availability: 'Disponible pour de nouvelles missions',
  yearsOfExperience: 5,
  /** Fichier placé dans /public — remplacez-le par votre propre PDF */
  cvUrl: '/cv-aldo-randriantsoamanitra.pdf',
  email: 'randriantsoamanitramichael1@gmail.com',
  phone: '+261 38 56 968 08',
  /** Version sans espaces pour les liens tel: */
  phoneHref: '+261385696808',
}

/* ---------------------------------- À propos -------------------------------- */

export const about = {
  title: 'À propos',
  heading: 'Concevoir des solutions métier sur mesure, du besoin à la maintenance.',
  paragraphs: [
    "Développeur Web Full Stack avec plus de 5 ans d'expérience dans le développement d'applications web, le support ERP, le développement backend et frontend ainsi que la gestion de bases de données.",
    "Habitué à analyser les besoins métiers, à concevoir des solutions sur mesure et à en assurer la maintenance, j'interviens aussi bien sur l'architecture des données que sur l'expérience utilisateur finale.",
    "Mon parcours mêle développement applicatif, accompagnement des utilisateurs et sens du design — un héritage de mes années de graphic designer qui se retrouve dans le soin apporté à chaque interface.",
  ],
  /** Chiffres clés affichés en compteurs animés */
  stats: [
    { value: 5, suffix: '+', label: "Années d'expérience" },
    { value: 3, suffix: '', label: 'Projets freelance livrés' },
    { value: 10, suffix: '+', label: 'Technologies maîtrisées' },
    { value: 3, suffix: '', label: 'Pays d’intervention' },
  ] as StatItem[],
}

/* -------------------------------- Compétences ------------------------------- */

export const skillGroups: SkillGroup[] = [
  {
    title: 'Langages & Frontend',
    description: "Interfaces réactives et intégrations soignées.",
    icon: 'code',
    items: ['PHP', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Bootstrap', 'Angular'],
  },
  {
    title: 'Backend & Frameworks',
    description: 'APIs robustes et applications métier.',
    icon: 'server',
    items: ['Laravel', 'CodeIgniter', 'NestJS', 'Oracle APEX'],
  },
  {
    title: 'Bases de données',
    description: 'Modélisation, requêtage et optimisation.',
    icon: 'database',
    items: ['SQL', 'PL/SQL', 'MySQL', 'Oracle Database'],
  },
  {
    title: 'Autres',
    description: 'Sécurité et gestion des identités.',
    icon: 'shield',
    items: ['Keycloak'],
  },
]

/* --------------------------- Expérience professionnelle --------------------- */

export const experiences: ExperienceItem[] = [
  {
    period: '01/2024 – 05/2025',
    role: 'Développeur Web',
    company: 'Ignfi',
    location: "Côte d'Ivoire",
    current: true,
    tasks: [
      "Participation à la mise à jour et à l'optimisation du portail SIGFU pour la Côte d'Ivoire",
      "Intégration d'améliorations fonctionnelles et techniques",
      'Maintenance évolutive et corrective de la plateforme',
    ],
    tags: ['Portail SIGFU', 'Optimisation', 'Maintenance'],
  },
  {
    period: '06/2020 – 01/2024',
    role: 'Développeur ERP',
    company: 'Tropic Mad',
    location: 'Madagascar, Maurice',
    tasks: [
      "Développement et maintenance d'applications ERP sous Oracle APEX",
      'Support technique et accompagnement des utilisateurs',
      'Analyse des besoins métiers et optimisation des bases Oracle',
    ],
    tags: ['Oracle APEX', 'PL/SQL', 'Support ERP'],
  },
  {
    period: '03/2018 – 06/2020',
    role: 'Graphic Designer',
    company: 'Tropic Mad',
    location: 'Madagascar',
    tasks: [
      'Création de supports graphiques et visuels des produits textiles de marques',
      'Réalisation des supports de communication interne',
    ],
    tags: ['Design graphique', 'Textile', 'Communication'],
  },
  {
    period: '2017 – 2018',
    role: 'Développeur Backend',
    company: 'Site Sortez et Vivre Versailles',
    location: 'Madagascar',
    tasks: [
      "Développement backend et gestion de la logique applicative",
      'Optimisation des performances et gestion des données',
    ],
    tags: ['Backend', 'Performance', 'Données'],
  },
  {
    period: '2014',
    role: 'Modérateur Web',
    company: 'Sweaze',
    location: 'Madagascar',
    tasks: ['Modération de contenu et gestion de la communauté'],
    tags: ['Modération', 'Communauté'],
  },
]

/* ------------------------------ Projets freelance --------------------------- */

export const projects: ProjectItem[] = [
  {
    title: 'Gestion des assiduités par reconnaissance faciale',
    client: 'École MCA',
    location: 'Madagascar',
    date: '02/2025',
    summary:
      "Conception et développement d'une application de gestion des assiduités basée sur la reconnaissance faciale.",
    highlights: [
      'Identification automatique des élèves par scan facial',
      'Automatisation de la prise de présence, gestion des absences et des retards',
      "Génération de rapports pour l'administration scolaire",
    ],
    tags: ['Reconnaissance faciale', 'Web App', 'Reporting'],
  },
  {
    title: 'Traçabilité des livres',
    client: 'Domaine Avaradrano',
    location: 'Madagascar',
    date: '06/2025',
    summary: "Développement d'un système de suivi des ouvrages d'une bibliothèque.",
    highlights: [
      'Gestion des entrées et des sorties d’ouvrages',
      'Historique complet des mouvements',
    ],
    tags: ['Traçabilité', 'Base de données', 'Back-office'],
  },
  {
    title: 'Suivi documentaire',
    client: 'Domaine Avaradrano',
    location: 'Madagascar',
    date: '09/2025',
    summary: "Conception d'une plateforme de gestion des documents administratifs.",
    highlights: ['Suivi des statuts des documents', 'Traçabilité et archivage centralisés'],
    tags: ['GED', 'Archivage', 'Workflow'],
  },
]

/* --------------------------------- Formation -------------------------------- */

export const education: EducationItem[] = [
  {
    degree: 'Master I en Informatique',
    school: 'Université INATA',
    year: '2015',
    detail: 'Spécialisation développement logiciel et systèmes d’information.',
  },
]

/* --------------------------------- Langues ---------------------------------- */

export const languages: LanguageItem[] = [
  { name: 'Français', level: 'Intermédiaire', value: 65 },
  { name: 'Anglais', level: 'Intermédiaire', value: 60 },
]

/* ------------------------------ Réseaux sociaux ----------------------------- */
/* Remplacez les « # » par vos véritables URLs.                                 */

export const socials: SocialLink[] = [
  { label: 'LinkedIn', href: '#', icon: 'linkedin' },
  { label: 'GitHub', href: '#', icon: 'github' },
]

/* -------------------------------- Navigation -------------------------------- */

export const navItems: NavItem[] = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'a-propos', label: 'À propos' },
  { id: 'competences', label: 'Compétences' },
  { id: 'experience', label: 'Expérience' },
  { id: 'projets', label: 'Projets' },
  { id: 'parcours', label: 'Parcours' },
  { id: 'contact', label: 'Contact' },
]

/* ----------------------- Couleurs d'accent disponibles ---------------------- */
/* Utilisées par le sélecteur d'accent dans la navbar (valeurs RGB brutes).     */

export const accentPresets = [
  { name: 'Bleu', value: '59 130 246', soft: '96 165 250' },
  { name: 'Cyan', value: '34 211 238', soft: '103 232 249' },
  { name: 'Violet', value: '139 92 246', soft: '167 139 250' },
  { name: 'Émeraude', value: '16 185 129', soft: '52 211 153' },
  { name: 'Ambre', value: '245 158 11', soft: '251 191 36' },
  { name: 'Orange', value: '249 115 22', soft: '251 146 60' },
  { name: 'Rose', value: '244 63 94', soft: '251 113 133' },
] as const
