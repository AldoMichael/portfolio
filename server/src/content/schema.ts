/**
 * ============================================================================
 *  SCHÉMA DES RESSOURCES ÉDITABLES
 * ----------------------------------------------------------------------------
 *  Ce fichier décrit, pour chaque ressource, la liste de ses champs.
 *  Il sert à deux choses :
 *    1. côté serveur, à valider et nettoyer les données reçues ;
 *    2. côté admin, à générer automatiquement les formulaires.
 *
 *  Ajouter un champ ici (et la colonne correspondante dans entities.ts)
 *  suffit à le rendre éditable dans l'interface d'administration.
 * ============================================================================
 */

export type FieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'list' | 'select' | 'url';

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  /** Refuse l'enregistrement si la valeur est vide. */
  required?: boolean;
  /** Valeurs possibles pour le type `select`. */
  options?: string[];
  /** Bornes pour le type `number`. */
  min?: number;
  max?: number;
  /** Texte d'aide affiché sous le champ dans l'admin. */
  help?: string;
};

export type ResourceDef = {
  key: string;
  /** Nom affiché dans l'admin. */
  label: string;
  description: string;
  /** Masque les boutons créer / supprimer (ressource à lignes fixes). */
  fixedRows?: boolean;
  fields: FieldDef[];
};

export const RESOURCES: ResourceDef[] = [
  {
    key: 'experiences',
    label: 'Parcours',
    description: 'Les postes affichés dans la timeline « Expérience ».',
    fields: [
      { name: 'period', label: 'Période', type: 'text', required: true, help: 'Ex. 01/2024 – 05/2025' },
      { name: 'role', label: 'Poste', type: 'text', required: true },
      { name: 'company', label: 'Entreprise', type: 'text', required: true },
      { name: 'location', label: 'Lieu', type: 'text', required: true },
      { name: 'current', label: 'Poste le plus récent', type: 'boolean' },
      { name: 'tasks', label: 'Missions', type: 'list', help: 'Une mission par ligne' },
      { name: 'tags', label: 'Mots-clés', type: 'list', help: 'Un mot-clé par ligne' },
      {
        name: 'url',
        label: "Lien de l'application",
        type: 'url',
        help: 'Rend la carte entièrement cliquable. Laisser vide s’il n’y a pas de lien.',
      },
      {
        name: 'demoUrl',
        label: 'Lien de la démo',
        type: 'url',
        help: 'Affiche un bouton « Démo » sur la carte.',
      },
    ],
  },
  {
    key: 'skills',
    label: 'Technologies',
    description: 'Les groupes de compétences affichés en badges.',
    fields: [
      { name: 'title', label: 'Titre du groupe', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'text' },
      {
        name: 'icon',
        label: 'Icône',
        type: 'select',
        options: ['code', 'server', 'database', 'shield'],
      },
      { name: 'items', label: 'Technologies', type: 'list', help: 'Une technologie par ligne' },
    ],
  },
  {
    key: 'stats',
    label: 'Statistiques',
    description: 'Les chiffres clés animés de la section « À propos ».',
    fields: [
      { name: 'value', label: 'Valeur', type: 'number', required: true, min: 0, max: 100000 },
      { name: 'suffix', label: 'Suffixe', type: 'text', help: 'Ex. + ou %' },
      { name: 'label', label: 'Libellé', type: 'text', required: true },
    ],
  },
  {
    key: 'projects',
    label: 'Applications métier',
    description: 'Les projets freelance présentés en cartes.',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'client', label: 'Client', type: 'text', required: true },
      { name: 'location', label: 'Lieu', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'text', required: true, help: 'Ex. 06/2025' },
      { name: 'summary', label: 'Résumé', type: 'textarea' },
      { name: 'highlights', label: 'Points clés', type: 'list', help: 'Un point par ligne' },
      { name: 'tags', label: 'Mots-clés', type: 'list', help: 'Un mot-clé par ligne' },
      {
        name: 'url',
        label: "Lien de l'application",
        type: 'url',
        help: 'Rend la carte entièrement cliquable. Laisser vide s’il n’y a pas de lien.',
      },
      {
        name: 'demoUrl',
        label: 'Lien de la démo',
        type: 'url',
        help: 'Affiche un bouton « Démo » sur la carte.',
      },
    ],
  },
  {
    key: 'education',
    label: 'Formation',
    description: 'Les diplômes affichés dans la section « Parcours ».',
    fields: [
      { name: 'degree', label: 'Diplôme', type: 'text', required: true },
      { name: 'school', label: 'Établissement', type: 'text', required: true },
      { name: 'year', label: 'Année', type: 'text', required: true },
      { name: 'detail', label: 'Détail', type: 'textarea' },
    ],
  },
  {
    key: 'languages',
    label: 'Langues',
    description: 'Les langues et leur barre de progression.',
    fields: [
      { name: 'name', label: 'Langue', type: 'text', required: true },
      { name: 'level', label: 'Niveau', type: 'text', required: true, help: 'Ex. Intermédiaire' },
      { name: 'value', label: 'Pourcentage', type: 'number', required: true, min: 0, max: 100 },
    ],
  },
  {
    key: 'socials',
    label: 'Réseaux sociaux',
    description: 'Les boutons LinkedIn, GitHub (et autres) du pied de page et du contact.',
    fields: [
      { name: 'label', label: 'Nom', type: 'text', required: true, help: 'Ex. LinkedIn' },
      {
        name: 'href',
        label: 'Lien',
        type: 'url',
        help: 'URL complète https://… Laisser vide pour masquer le bouton.',
      },
      {
        name: 'icon',
        label: 'Icône',
        type: 'select',
        options: ['linkedin', 'github', 'mail', 'phone'],
      },
    ],
  },
  {
    key: 'clients',
    label: 'Ils nous ont fait confiance',
    description: 'Les entreprises affichées dans la section « Ils nous ont fait confiance ».',
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true },
      {
        name: 'logoUrl',
        label: 'Logo (URL)',
        type: 'url',
        help: 'Lien https://… vers le logo (PNG, SVG ou JPEG). Laisser vide pour n’afficher que le nom.',
      },
      {
        name: 'href',
        label: 'Site web',
        type: 'url',
        help: 'Rend la carte cliquable. Laisser vide s’il n’y a pas de lien.',
      },
    ],
  },
  {
    key: 'settings',
    label: 'Réglages',
    description: "Valeurs globales réutilisées sur l'ensemble du site.",
    fixedRows: true,
    fields: [
      { name: 'key', label: 'Clé', type: 'text', required: true },
      { name: 'label', label: 'Libellé', type: 'text' },
      { name: 'value', label: 'Valeur', type: 'text', required: true },
    ],
  },
];

export const RESOURCE_MAP = new Map(RESOURCES.map((resource) => [resource.key, resource]));
