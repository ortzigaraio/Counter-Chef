/**
 * Convierte catalog/*.md en public/catalog/recipes.json usando el mismo parser
 * de ingredientes que la app. Uso: npm run catalog
 *
 * Formato de cada receta:
 *   # Título
 *   cat: pizza | rinde: 4 bolas | prep: 30 | fuego: 2 | foto: en:Pizza Margherita | tags: a, b
 *   - 600 g harina 00
 *   1. Paso…
 *   nota: texto libre
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { CATEGORIES, type Category, type Ingredient } from '../src/data/types'
import { parseIngredientLine } from '../src/lib/parse'
import type { CatalogRecipe } from '../src/data/catalog'

const ROOT = join(import.meta.dirname, '..')
const SRC = join(ROOT, 'catalog')
const OUT = join(ROOT, 'public', 'catalog')

// Mismo slug que scripts/catalog_photos.py (60 caracteres).
const slugOf = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)

type Credit = { file: string; author: string; license: string; licenseUrl: string; source: string }
const credits: Record<string, Credit> = existsSync(join(SRC, 'photos.json')) ? JSON.parse(readFileSync(join(SRC, 'photos.json'), 'utf8')) : {}

const recipes: CatalogRecipe[] = []
const warnings: string[] = []

// Los clásicos primero; los ficheros -extra después.
const byExtra = (a: string, b: string) => Number(a.includes('-extra')) - Number(b.includes('-extra')) || a.localeCompare(b)
for (const file of readdirSync(SRC).filter((f) => f.endsWith('.md')).sort(byExtra)) {
  const blocks = readFileSync(join(SRC, file), 'utf8').split(/^# /m).slice(1)
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim())
    const title = lines[0]
    const meta = Object.fromEntries(
      (lines.find((l) => l.startsWith('cat:')) ?? '')
        .split('|')
        .map((p) => p.split(':'))
        .map(([k, ...v]) => [k.trim(), v.join(':').trim()]),
    )
    const category = meta.cat as Category
    if (!CATEGORIES.some((c) => c.id === category)) warnings.push(`${title}: categoría «${meta.cat}»`)
    const [, n, label] = (meta.rinde ?? '').match(/^([\d,.]+)\s*(.*)$/) ?? []
    const slug = slugOf(title)
    const ingredients: Ingredient[] = lines
      .filter((l) => l.startsWith('- '))
      .map((l, i) => parseIngredientLine(l.slice(2), `${slug}-${i}`))
    const steps = lines.filter((l) => /^\d+\.\s/.test(l)).map((l) => l.replace(/^\d+\.\s*/, ''))
    const notes = lines.find((l) => l.startsWith('nota:'))?.slice(5).trim()
    for (const ing of ingredients) if (!ing.name) warnings.push(`${title}: ingrediente vacío`)
    if (ingredients.length < 1 || steps.length < 1) warnings.push(`${title}: faltan ingredientes o pasos`)
    if (recipes.some((r) => r.slug === slug)) warnings.push(`${title}: título duplicado`)
    const c = credits[slug]
    recipes.push({
      slug,
      title,
      category,
      servings: Number((n ?? '4').replace(',', '.')) || 4,
      servingsLabel: label || 'raciones',
      prepMin: Number(meta.prep) || undefined,
      cookMin: Number(meta.fuego) || undefined,
      ingredients,
      steps,
      tags: (meta.tags ?? '').split(',').map((t: string) => t.trim()).filter(Boolean),
      notes,
      photo: c ? `catalog/img/${slug}.webp` : undefined,
      credit: c ? { author: c.author, license: c.license, licenseUrl: c.licenseUrl, source: c.source } : undefined,
    })
  }
}

// Orden de «Todas»: primero las que tienen foto, alternando categorías para que no salgan 40 panes seguidos.
function interleave(list: CatalogRecipe[]) {
  const queues = CATEGORIES.map((c) => list.filter((r) => r.category === c.id))
  const out: CatalogRecipe[] = []
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) out.push(q.shift()!)
  return out
}
const ordered = [...interleave(recipes.filter((r) => r.photo)), ...interleave(recipes.filter((r) => !r.photo))]

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'recipes.json'), JSON.stringify(ordered))
const withPhoto = recipes.filter((r) => r.photo).length
console.log(`${recipes.length} recetas · ${withPhoto} con foto · ${warnings.length} avisos`)
for (const w of warnings) console.log('  aviso:', w)
