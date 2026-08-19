/**
 * ============================================================================
 *  DONNÉES INITIALES
 * ----------------------------------------------------------------------------
 *  Contenu de départ inséré en base par « npm run seed ».
 *  Il reprend le CV d'origine : une fois en base, tout se modifie
 *  depuis l'interface d'administration, plus besoin de toucher ce fichier.
 * ============================================================================
 */

export const seedExperiences = [
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
    current: false,
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
    current: false,
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
    current: false,
    tasks: [
      'Développement backend et gestion de la logique applicative',
      'Optimisation des performances et gestion des données',
    ],
    tags: ['Backend', 'Performance', 'Données'],
  },
  {
    period: '2014',
    role: 'Modérateur Web',
    company: 'Sweaze',
    location: 'Madagascar',
    current: false,
    tasks: ['Modération de contenu et gestion de la communauté'],
    tags: ['Modération', 'Communauté'],
  },
];

export const seedSkillGroups = [
  {
    title: 'Langages & Frontend',
    description: 'Interfaces réactives et intégrations soignées.',
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
    items: ['SQL', 'PL/SQL', 'MySQL', 'Oracle Database', 'PostgreSQL'],
  },
  {
    title: 'Autres',
    description: 'Sécurité et gestion des identités.',
    icon: 'shield',
    items: ['Keycloak'],
  },
];

export const seedStats = [
  { value: 5, suffix: '+', label: "Années d'expérience" },
  { value: 3, suffix: '', label: 'Projets freelance livrés' },
  { value: 10, suffix: '+', label: 'Technologies maîtrisées' },
  { value: 3, suffix: '', label: "Pays d'intervention" },
];

export const seedProjects = [
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
      "Gestion des entrées et des sorties d'ouvrages",
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
];

export const seedEducation = [
  {
    degree: 'Master I en Informatique',
    school: 'Université INATA',
    year: '2015',
    detail: "Spécialisation développement logiciel et systèmes d'information.",
  },
];

export const seedLanguages = [
  { name: 'Français', level: 'Intermédiaire', value: 65 },
  { name: 'Anglais', level: 'Intermédiaire', value: 60 },
];

export const seedSocials = [
  { label: 'LinkedIn', href: '', icon: 'linkedin' },
  { label: 'GitHub', href: '', icon: 'github' },
];

export const seedClients = [
  { name: 'Ignfi', logoUrl: '', href: 'https://sigfu.gouv.ci/' },
  { name: 'Tropic Mad', logoUrl: '', href: '' },
  { name: 'École MCA', logoUrl: '', href: '' },
  { name: 'Domaine Avaradrano', logoUrl: '', href: '' },
];

export const seedSettings = [
  {
    key: 'yearsOfExperience',
    label: "Années d'expérience",
    value: '5',
  },
  {
    key: 'availability',
    label: 'Statut de disponibilité',
    value: 'Disponible pour de nouvelles missions',
  },
  {
    key: 'tagline',
    label: 'Accroche du Hero',
    value:
      "Plus de 5 ans d'expérience en développement d'applications web, support ERP, développement backend / frontend et gestion de bases de données.",
  },
];
