export type YeastType = 'fresca' | 'seca' | 'instantanea' | 'masa-madre'
export type Preferment = 'directo' | 'poolish' | 'biga'

export interface DoughInput {
  balls: number
  ballWeight: number
  hydration: number // %
  salt: number // %
  oil: number // %
  sugar: number // %
  yeast: YeastType
  hours: number
  tempC: number
  preferment: Preferment
  prefermentPct: number // % de la harina total que va al prefermento
}

export interface DoughLine {
  name: string
  grams: number
  pct: number
}

export interface DoughResult {
  total: number
  flour: number
  water: number
  yeastPct: number
  main: DoughLine[]
  pre: DoughLine[] | null
}

export const YEAST_LABEL: Record<YeastType, string> = {
  fresca: 'Levadura fresca',
  seca: 'Levadura seca',
  instantanea: 'Levadura instantánea',
  'masa-madre': 'Masa madre (100 %)',
}

/** Equivalencia respecto a la levadura fresca. */
const YEAST_FACTOR: Record<Exclude<YeastType, 'masa-madre'>, number> = { fresca: 1, seca: 0.4, instantanea: 0.33 }

/**
 * Estimación de levadura fresca (% sobre harina) según tiempo y temperatura.
 * Ajustada a referencias habituales: 8 h a 22 °C ≈ 0,3 %; 24 h a 22 °C ≈ 0,09 %;
 * 48 h en nevera (4 °C) ≈ 0,25 %. La temperatura dobla la velocidad cada ~7 °C.
 */
export function freshYeastPct(hours: number, tempC: number) {
  const h = Math.max(1, hours)
  const pct = (2.95 / h ** 1.1) * 2 ** ((22 - tempC) / 7)
  return Math.min(3, Math.max(0.02, pct))
}

/** Masa madre (% sobre harina) para el mismo calendario. */
export function starterPct(hours: number, tempC: number) {
  const pct = 20 * (8 / Math.max(2, hours)) * 2 ** ((22 - tempC) / 7)
  return Math.min(40, Math.max(5, pct))
}

export function yeastPctFor(type: YeastType, hours: number, tempC: number) {
  if (type === 'masa-madre') return starterPct(hours, tempC)
  return freshYeastPct(hours, tempC) * YEAST_FACTOR[type]
}

export function computeDough(input: DoughInput): DoughResult {
  const total = input.balls * input.ballWeight
  const yeastPct = yeastPctFor(input.yeast, input.hours, input.tempC)
  const sum = 100 + input.hydration + input.salt + input.oil + input.sugar + yeastPct
  const flour = (total / sum) * 100
  const water = (flour * input.hydration) / 100
  const salt = (flour * input.salt) / 100
  const oil = (flour * input.oil) / 100
  const sugar = (flour * input.sugar) / 100
  let yeast = (flour * yeastPct) / 100

  let mainFlour = flour
  let mainWater = water
  // La masa madre al 100 % aporta mitad harina, mitad agua.
  if (input.yeast === 'masa-madre') {
    mainFlour -= yeast / 2
    mainWater -= yeast / 2
  }

  let pre: DoughLine[] | null = null
  if (input.preferment !== 'directo' && input.yeast !== 'masa-madre') {
    const pf = (flour * input.prefermentPct) / 100
    const pfHyd = input.preferment === 'poolish' ? 1 : 0.45
    const pw = Math.min(pf * pfHyd, mainWater)
    // Levadura del prefermento (en fresca): poolish 0,1 %, biga 1 % sobre su harina
    const py = pf * (input.preferment === 'poolish' ? 0.001 : 0.01) * YEAST_FACTOR[input.yeast]
    pre = [
      { name: 'Harina', grams: pf, pct: (pf / flour) * 100 },
      { name: 'Agua', grams: pw, pct: (pw / flour) * 100 },
      { name: YEAST_LABEL[input.yeast], grams: py, pct: (py / flour) * 100 },
    ]
    mainFlour -= pf
    mainWater -= pw
    yeast = Math.max(0, yeast - py)
  }

  const main: DoughLine[] = [
    { name: pre ? 'Harina (resto)' : 'Harina', grams: mainFlour, pct: (mainFlour / flour) * 100 },
    { name: pre ? 'Agua (resto)' : 'Agua', grams: mainWater, pct: (mainWater / flour) * 100 },
    { name: 'Sal', grams: salt, pct: input.salt },
    ...(input.oil > 0 ? [{ name: 'Aceite de oliva', grams: oil, pct: input.oil }] : []),
    ...(input.sugar > 0 ? [{ name: 'Azúcar', grams: sugar, pct: input.sugar }] : []),
    { name: YEAST_LABEL[input.yeast], grams: yeast, pct: (yeast / flour) * 100 },
  ]
  if (pre) main.unshift({ name: input.preferment === 'poolish' ? 'Poolish (todo)' : 'Biga (toda)', grams: pre.reduce((s, l) => s + l.grams, 0), pct: 0 })

  return { total, flour, water, yeastPct, main, pre }
}

export const DOUGH_PRESETS: { id: string; label: string; input: Partial<DoughInput> }[] = [
  { id: 'napo', label: 'Napolitana 24 h', input: { ballWeight: 260, hydration: 65, salt: 2.8, oil: 0, sugar: 0, hours: 24, tempC: 20, yeast: 'fresca', preferment: 'directo' } },
  { id: 'napo-pool', label: 'Napolitana con poolish', input: { ballWeight: 260, hydration: 70, salt: 2.8, oil: 0, sugar: 0, hours: 18, tempC: 20, yeast: 'fresca', preferment: 'poolish', prefermentPct: 30 } },
  { id: 'ny', label: 'New York 48 h nevera', input: { ballWeight: 300, hydration: 62, salt: 2.5, oil: 3, sugar: 2, hours: 48, tempC: 4, yeast: 'instantanea', preferment: 'directo' } },
  { id: 'teglia', label: 'Pizza en bandeja', input: { balls: 1, ballWeight: 900, hydration: 80, salt: 2.5, oil: 3, sugar: 0, hours: 24, tempC: 4, yeast: 'seca', preferment: 'biga', prefermentPct: 40 } },
  { id: 'pan', label: 'Pan de pueblo', input: { balls: 1, ballWeight: 900, hydration: 70, salt: 2, oil: 0, sugar: 0, hours: 12, tempC: 21, yeast: 'masa-madre', preferment: 'directo' } },
  { id: 'focaccia', label: 'Focaccia', input: { balls: 1, ballWeight: 1000, hydration: 78, salt: 2.5, oil: 4, sugar: 0, hours: 6, tempC: 24, yeast: 'seca', preferment: 'directo' } },
]

export const DEFAULT_DOUGH: DoughInput = {
  balls: 4,
  ballWeight: 260,
  hydration: 65,
  salt: 2.8,
  oil: 0,
  sugar: 0,
  yeast: 'fresca',
  hours: 24,
  tempC: 20,
  preferment: 'directo',
  prefermentPct: 30,
}
