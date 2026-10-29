import { useEffect, useState } from 'react'
import type { Category, Ingredient, Recipe } from './types'
import { db } from './db'
import { saveRecipe } from './repo'

/** Receta del catálogo incluido en la app (public/catalog/recipes.json, generado con `npm run catalog`). */
export interface CatalogRecipe {
  slug: string
  title: string
  category: Category
  servings: number
  servingsLabel: string
  prepMin?: number
  cookMin?: number
  ingredients: Ingredient[]
  steps: string[]
  tags: string[]
  notes?: string
  photo?: string
  credit?: { author: string; license: string; licenseUrl: string; source: string }
}

let cache: Promise<CatalogRecipe[]> | null = null

/** Se descarga una vez y queda en memoria; el service worker lo guarda para usarlo sin conexión. */
export function loadCatalog(): Promise<CatalogRecipe[]> {
  cache ??= fetch('catalog/recipes.json')
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json() as Promise<CatalogRecipe[]>
    })
    .catch((e) => {
      cache = null
      throw e
    })
  return cache
}

export function useCatalog() {
  const [state, setState] = useState<{ list?: CatalogRecipe[]; error?: boolean }>({})
  useEffect(() => {
    let alive = true
    loadCatalog()
      .then((list) => alive && setState({ list }))
      .catch(() => alive && setState({ error: true }))
    return () => {
      alive = false
    }
  }, [])
  return state
}

export const creditText = (c: CatalogRecipe['credit']) => (c ? `Foto: ${c.author} · ${c.license} · Wikimedia Commons` : undefined)

export async function findSaved(slug: string): Promise<Recipe | undefined> {
  return db.recipes.filter((r) => r.catalogSlug === slug).first()
}

/** Copia una receta del catálogo a tu recetario (una sola vez). */
export async function saveFromCatalog(c: CatalogRecipe): Promise<Recipe> {
  const existing = await findSaved(c.slug)
  if (existing) return existing
  const { slug, credit, ...rest } = c
  return saveRecipe({
    ...rest,
    ingredients: rest.ingredients.map((i) => ({ ...i })),
    catalogSlug: slug,
    photoCredit: creditText(credit),
  })
}

/** Selección estable por día para la portada. */
export function dailyPicks(list: CatalogRecipe[], n: number, seed: number) {
  const withPhoto = list.filter((r) => r.photo)
  const out: CatalogRecipe[] = []
  let x = seed
  const used = new Set<number>()
  while (out.length < Math.min(n, withPhoto.length)) {
    x = (x * 9301 + 49297) % 233280
    const i = x % withPhoto.length
    if (used.has(i)) continue
    used.add(i)
    out.push(withPhoto[i])
  }
  return out
}
