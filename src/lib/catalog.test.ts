import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CATEGORIES } from '../data/types'
import type { CatalogRecipe } from '../data/catalog'

const file = join(process.cwd(), 'public', 'catalog', 'recipes.json')

describe.runIf(existsSync(file))('catálogo', () => {
  const list = JSON.parse(readFileSync(file, 'utf8')) as CatalogRecipe[]

  it('tiene cientos de recetas completas', () => {
    expect(list.length).toBeGreaterThan(300)
    for (const r of list) {
      expect(CATEGORIES.map((c) => c.id)).toContain(r.category)
      expect(r.ingredients.length).toBeGreaterThan(0)
      expect(r.steps.length).toBeGreaterThan(0)
      expect(r.servings).toBeGreaterThan(0)
    }
  })

  it('slugs únicos y fotos existentes con crédito', () => {
    expect(new Set(list.map((r) => r.slug)).size).toBe(list.length)
    for (const r of list.filter((x) => x.photo)) {
      expect(existsSync(join(process.cwd(), 'public', r.photo!))).toBe(true)
      expect(r.credit?.license).toBeTruthy()
      expect(r.credit?.source).toMatch(/^https:\/\//)
    }
  })
})
