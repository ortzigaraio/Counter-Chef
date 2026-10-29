import type { Challenge, CookLog, Recipe } from '../data/types'

export const RANKS = [
  'Plata I · Quematostadas',
  'Plata II · Pinche de microondas',
  'Plata III · Abrelatas',
  'Plata IV · Hervidor de agua',
  'Plata Élite · Huevo con puntilla',
  'Plata Élite Maestra · Tortilla entera',
  'Nova I · Pizza decente',
  'Nova II · Masa que sube',
  'Nova III · Croqueta redonda',
  'Nova Maestra · Sofrito con paciencia',
  'Guardián I · Pan con alveolo',
  'Guardián II · Punto de sal',
  'Guardián Élite · Fondo oscuro',
  'Guardián Distinguido · Emulsión estable',
  'Águila Legendaria · Hojaldre de 729 capas',
  'Águila Legendaria Maestra · Jefe de partida',
  'Maestro Supremo · Sous-chef',
  'Élite Global del Fogón',
] as const

/** Puntos necesarios para cada rango: crece rápido al principio y se estira al final. */
export const threshold = (i: number) => Math.round(18 * i ** 1.55)

export function points(recipes: Recipe[], logs: CookLog[], challenges: Challenge[]) {
  const cookPts = logs.reduce((s, l) => s + 10 + (l.rating - 3) * 4 + (l.outcome === 'clavada' ? 4 : 0), 0)
  const won = challenges.filter((c) => c.status === 'cerrado' && (c.myRating ?? 0) > (c.rivalRating ?? 0)).length
  return Math.max(0, cookPts + recipes.filter((r) => !r.catalogSlug).length * 3 + won * 15)
}

export function rankFor(pts: number) {
  let i = 0
  while (i < RANKS.length - 1 && pts >= threshold(i + 1)) i++
  const next = i < RANKS.length - 1 ? threshold(i + 1) : null
  const floor = threshold(i)
  return {
    index: i,
    name: RANKS[i],
    points: pts,
    next,
    progress: next ? (pts - floor) / (next - floor) : 1,
  }
}

/** Días seguidos (hasta hoy o ayer) con al menos una entrada en el diario. */
export function streak(logs: CookLog[], today = new Date()) {
  const days = new Set(logs.map((l) => l.date))
  const d = new Date(today)
  if (!days.has(isoDate(d))) d.setDate(d.getDate() - 1)
  let n = 0
  while (days.has(isoDate(d))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

export const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
