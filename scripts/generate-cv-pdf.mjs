/**
 * Génère le CV au format PDF dans /public à partir des données du portfolio.
 *
 *   node scripts/generate-cv-pdf.mjs
 *
 * Le script n'utilise aucune dépendance : il écrit directement un PDF 1.4
 * (polices Helvetica standard, encodage WinAnsi).
 * Remplacez simplement le fichier généré si vous préférez votre propre mise en page.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT = resolve(ROOT, 'public/cv-aldo-randriantsoamanitra.pdf')

/* ----------------------------- Contenu du CV ------------------------------ */

const CV = {
  name: 'ALDO MICHAEL FIRMIN RANDRIANTSOAMANITRA',
  role: 'Développeur Web / Développeur Full Stack',
  contact: 'Madagascar  |  +261 38 56 968 08  |  randriantsoamanitramichael1@gmail.com',
  profil:
    "Développeur Web Full Stack avec plus de 5 ans d'expérience dans le développement d'applications web, le support ERP, le développement backend et frontend ainsi que la gestion de bases de données. Habitué à analyser les besoins métiers, concevoir des solutions sur mesure et assurer leur maintenance.",
  competences: [
    'Langages / Frontend : PHP, JavaScript, TypeScript, HTML, CSS, Bootstrap, Angular',
    'Backend / Frameworks : Laravel, CodeIgniter, NestJS, Oracle APEX',
    'Bases de données : SQL, PL/SQL, MySQL, Oracle Database',
    'Autres : Keycloak',
  ],
  experiences: [
    {
      period: '01/2024 - 05/2025',
      title: "Développeur Web - Ignfi (Côte d'Ivoire)",
      tasks: [
        "Mise à jour et optimisation du portail SIGFU pour la Côte d'Ivoire",
        "Intégration d'améliorations fonctionnelles et techniques",
        'Maintenance évolutive et corrective de la plateforme',
      ],
    },
    {
      period: '06/2020 - 01/2024',
      title: 'Développeur ERP - Tropic Mad (Madagascar, Maurice)',
      tasks: [
        "Développement et maintenance d'applications ERP sous Oracle APEX",
        'Support technique et accompagnement des utilisateurs',
        'Analyse des besoins métiers et optimisation des bases Oracle',
      ],
    },
    {
      period: '03/2018 - 06/2020',
      title: 'Graphic Designer - Tropic Mad (Madagascar)',
      tasks: [
        'Création de supports graphiques et visuels des produits textiles de marques',
        'Supports de communication interne',
      ],
    },
    {
      period: '2017 - 2018',
      title: 'Développeur Backend - Site Sortez et Vivre Versailles (Madagascar)',
      tasks: [
        'Développement backend et gestion de la logique applicative',
        'Optimisation des performances et gestion des données',
      ],
    },
    {
      period: '2014',
      title: 'Modérateur Web - Sweaze (Madagascar)',
      tasks: ['Modération de contenu et gestion de la communauté'],
    },
  ],
  projets: [
    {
      title: 'Gestion des assiduités par reconnaissance faciale - École MCA (02/2025)',
      tasks: [
        'Identification automatique des élèves par scan facial',
        'Automatisation des présences, absences et retards',
        "Génération de rapports pour l'administration scolaire",
      ],
    },
    {
      title: 'Traçabilité des livres - Domaine Avaradrano, Madagascar (06/2025)',
      tasks: ['Suivi des ouvrages : entrées, sorties et historique des mouvements'],
    },
    {
      title: 'Suivi documentaire - Domaine Avaradrano, Madagascar (09/2025)',
      tasks: ['Gestion des documents administratifs : statuts, traçabilité et archivage'],
    },
  ],
  formation: 'Master I en Informatique - Université INATA (2015)',
  langues: 'Français : intermédiaire  |  Anglais : intermédiaire',
}

/* --------------------------- Moteur PDF minimal --------------------------- */

const PAGE_WIDTH = 595.28 // A4
const PAGE_HEIGHT = 841.89
const MARGIN = 56
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2

// Largeurs approximatives des glyphes Helvetica (suffisant pour le retour à la ligne)
const charWidth = (size) => size * 0.5

const wrap = (text, size) => {
  const maxChars = Math.floor(MAX_WIDTH / charWidth(size))
  const words = text.split(' ')
  const lines = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (candidate.length > maxChars) {
      if (line) lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

/** Échappe les caractères réservés PDF et remplace les guillemets typographiques. */
const escapeText = (text) =>
  text
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')

const pages = []
let content = ''
let cursorY = PAGE_HEIGHT - MARGIN

const newPage = () => {
  if (content) pages.push(content)
  content = ''
  cursorY = PAGE_HEIGHT - MARGIN
}

const ensureSpace = (needed) => {
  if (cursorY - needed < MARGIN) newPage()
}

const text = (value, { size = 10, bold = false, color = '0.15 0.17 0.21', indent = 0 } = {}) => {
  for (const line of wrap(value, size)) {
    ensureSpace(size + 4)
    content +=
      `BT ${color} rg /${bold ? 'F2' : 'F1'} ${size} Tf ` +
      `1 0 0 1 ${MARGIN + indent} ${cursorY.toFixed(2)} Tm (${escapeText(line)}) Tj ET\n`
    cursorY -= size + 4
  }
}

const gap = (value) => {
  cursorY -= value
}

const rule = (color = '0.96 0.62 0.04') => {
  ensureSpace(10)
  content += `${color} rg ${MARGIN} ${cursorY.toFixed(2)} ${MAX_WIDTH} 1.2 re f\n`
  cursorY -= 12
}

const heading = (label) => {
  ensureSpace(34)
  gap(8)
  text(label.toUpperCase(), { size: 11.5, bold: true, color: '0.96 0.62 0.04' })
  rule('0.9 0.9 0.92')
}

/* ------------------------------ Mise en page ------------------------------ */

// Bandeau d'en-tête
content += `0.02 0.03 0.05 rg 0 ${(PAGE_HEIGHT - 118).toFixed(2)} ${PAGE_WIDTH} 118 re f\n`
cursorY = PAGE_HEIGHT - 52
text(CV.name, { size: 17, bold: true, color: '1 1 1' })
gap(2)
text(CV.role, { size: 11.5, bold: true, color: '0.96 0.62 0.04' })
gap(2)
text(CV.contact, { size: 9, color: '0.75 0.77 0.8' })
cursorY = PAGE_HEIGHT - 150

heading('Profil')
text(CV.profil, { size: 10 })

heading('Compétences')
for (const line of CV.competences) text(`•  ${line}`, { size: 10 })

heading('Expérience professionnelle')
for (const job of CV.experiences) {
  ensureSpace(46)
  text(job.period, { size: 9, bold: true, color: '0.96 0.62 0.04' })
  text(job.title, { size: 11, bold: true })
  for (const task of job.tasks) text(`-  ${task}`, { size: 10, indent: 10 })
  gap(6)
}

heading('Projets freelance')
for (const project of CV.projets) {
  ensureSpace(40)
  text(project.title, { size: 10.5, bold: true })
  for (const task of project.tasks) text(`-  ${task}`, { size: 10, indent: 10 })
  gap(6)
}

heading('Formation')
text(CV.formation, { size: 10 })

heading('Langues')
text(CV.langues, { size: 10 })

newPage() // pousse la dernière page dans la pile

/* ---------------------------- Assemblage du PDF ---------------------------- */

const objects = []
const pageCount = pages.length
const firstPageId = 3
const contentIds = pages.map((_, index) => firstPageId + pageCount + index)

// 1 : catalogue
objects.push('<< /Type /Catalog /Pages 2 0 R >>')

// 2 : arbre des pages
const kids = pages.map((_, index) => `${firstPageId + index} 0 R`).join(' ')
objects.push(
  `<< /Type /Pages /Count ${pageCount} /Kids [${kids}] /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] >>`,
)

// 3..n : pages
const fontsId = firstPageId + pageCount * 2
pages.forEach((_, index) => {
  objects.push(
    `<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 ${fontsId} 0 R /F2 ${
      fontsId + 1
    } 0 R >> >> /Contents ${contentIds[index]} 0 R >>`,
  )
})

// flux de contenu
pages.forEach((pageContent) => {
  objects.push(`<< /Length ${Buffer.byteLength(pageContent, 'latin1')} >>\nstream\n${pageContent}endstream`)
})

// polices
objects.push(
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
)
objects.push(
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
)

let pdf = '%PDF-1.4\n'
const offsets = [0]

objects.forEach((body, index) => {
  offsets.push(Buffer.byteLength(pdf, 'latin1'))
  pdf += `${index + 1} 0 obj\n${body}\nendobj\n`
})

const xrefOffset = Buffer.byteLength(pdf, 'latin1')
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
for (let index = 1; index <= objects.length; index++) {
  pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`

mkdirSync(dirname(OUTPUT), { recursive: true })
writeFileSync(OUTPUT, Buffer.from(pdf, 'latin1'))
console.log(`CV généré : ${OUTPUT} (${pageCount} page(s))`)
