import type { Ingredient } from '../data/types'
import { matchFood, type Food } from './foods'
import { getUnit, toGrams } from './units'

export function scaleIngredients(list: Ingredient[], factor: number): Ingredient[] {
  return list.map((i) => ({ ...i, qty: i.qty == null ? null : i.qty * factor }))
}

/** Factor necesario para que `ing` pase a pesar `target` gramos. */
export function factorForTarget(ing: Ingredient, targetGrams: number): number | null {
  const g = toGrams(ing.qty, ing.unit, ing.name)
  if (!g || g <= 0 || targetGrams <= 0) return null
  return targetGrams / g
}

const isFlour = (i: Ingredient, food: Food | undefined) => i.isFlour ?? food?.flour ?? false

export interface BakerRow {
  ingredient: Ingredient
  grams: number | null
  pct: number | null
}

/** Porcentaje panadero: la suma de harinas = 100 %. */
export function bakerPercentages(list: Ingredient[]): { flour: number; rows: BakerRow[]; hydration: number | null } {
  const rows = list.map((ingredient) => {
    const food = matchFood(ingredient.name)
    return { ingredient, food, grams: toGrams(ingredient.qty, ingredient.unit, ingredient.name, food) }
  })
  const flour = rows.filter((r) => isFlour(r.ingredient, r.food)).reduce((s, r) => s + (r.grams ?? 0), 0)
  // Agua efectiva: agua + leche (≈ 87 % agua) + la mitad de la masa madre al 100 %
  const water = rows.reduce((s, r) => {
    if (!r.grams) return s
    if (r.food?.key === 'agua') return s + r.grams
    if (r.food?.key === 'leche' || r.food?.key === 'leche-desnatada') return s + r.grams * 0.87
    if (r.food?.key === 'huevo') return s + r.grams * 0.75
    return s
  }, 0)
  const starter = rows.find((r) => r.food?.key === 'masa-madre')?.grams ?? 0
  const totalFlour = flour + starter / 2
  return {
    flour,
    hydration: totalFlour > 0 ? ((water + starter / 2) / totalFlour) * 100 : null,
    rows: rows.map((r) => ({
      ingredient: r.ingredient,
      grams: r.grams,
      pct: flour > 0 && r.grams != null ? (r.grams / flour) * 100 : null,
    })),
  }
}

/** Convierte una lista a gramos cuando se puede (para cocinar con báscula). */
export function toMetric(list: Ingredient[]): Ingredient[] {
  return list.map((i) => {
    const u = getUnit(i.unit)
    if (!u || u.kind === 'mass') return i
    if (u.kind === 'volume' && (u.id === 'ml' || u.id === 'l')) return i
    const g = toGrams(i.qty, i.unit, i.name)
    if (g == null || u.kind === 'count') return i
    return { ...i, qty: g, unit: 'g' }
  })
}
