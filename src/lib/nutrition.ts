import type { Ingredient } from '../data/types'
import { matchFood, type Food } from './foods'
import { toGrams } from './units'

export interface Nutrients {
  kcal: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  salt: number
}

export const NUTRIENT_LABELS: { key: keyof Nutrients; label: string; unit: string }[] = [
  { key: 'kcal', label: 'Energía', unit: 'kcal' },
  { key: 'protein', label: 'Proteínas', unit: 'g' },
  { key: 'carbs', label: 'Hidratos', unit: 'g' },
  { key: 'fat', label: 'Grasas', unit: 'g' },
  { key: 'fiber', label: 'Fibra', unit: 'g' },
  { key: 'salt', label: 'Sal', unit: 'g' },
]

const zero = (): Nutrients => ({ kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, salt: 0 })

export interface NutritionReport {
  total: Nutrients
  perServing: Nutrients
  grams: number
  matched: { ingredient: Ingredient; food: Food; grams: number }[]
  missing: Ingredient[]
}

export function nutrition(list: Ingredient[], servings: number): NutritionReport {
  const total = zero()
  const matched: NutritionReport['matched'] = []
  const missing: Ingredient[] = []
  let grams = 0
  for (const ingredient of list) {
    const food = matchFood(ingredient.name)
    const g = food ? toGrams(ingredient.qty, ingredient.unit, ingredient.name, food) : null
    if (!food || g == null) {
      if (ingredient.qty != null || !/gusto/.test(ingredient.note ?? '')) missing.push(ingredient)
      continue
    }
    const f = g / 100
    const [kcal, protein, carbs, fat, fiber, salt] = food.n
    total.kcal += kcal * f
    total.protein += protein * f
    total.carbs += carbs * f
    total.fat += fat * f
    total.fiber += fiber * f
    total.salt += salt * f
    grams += g
    matched.push({ ingredient, food, grams: g })
  }
  const s = Math.max(1, servings)
  const perServing = Object.fromEntries(Object.entries(total).map(([k, v]) => [k, v / s])) as unknown as Nutrients
  return { total, perServing, grams, matched, missing }
}
