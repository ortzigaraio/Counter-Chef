import { matchFood, normalize, type Food } from './foods'

export type UnitKind = 'mass' | 'volume' | 'count' | 'vague'

export interface UnitDef {
  id: string
  one: string
  many: string
  kind: UnitKind
  /** g para masa, ml para volumen, g aproximados para vagas. */
  base?: number
  aliases: string[]
}

export const UNITS: UnitDef[] = [
  { id: 'g', one: 'g', many: 'g', kind: 'mass', base: 1, aliases: ['g', 'gr', 'grs', 'gramo', 'gramos', 'grams', 'gram'] },
  { id: 'kg', one: 'kg', many: 'kg', kind: 'mass', base: 1000, aliases: ['kg', 'kgs', 'kilo', 'kilos', 'kilogramo', 'kilogramos'] },
  { id: 'mg', one: 'mg', many: 'mg', kind: 'mass', base: 0.001, aliases: ['mg', 'miligramo', 'miligramos'] },
  { id: 'oz', one: 'oz', many: 'oz', kind: 'mass', base: 28.3495, aliases: ['oz', 'onza', 'onzas', 'ounce', 'ounces'] },
  { id: 'lb', one: 'lb', many: 'lb', kind: 'mass', base: 453.592, aliases: ['lb', 'lbs', 'libra', 'libras', 'pound', 'pounds'] },
  { id: 'ml', one: 'ml', many: 'ml', kind: 'volume', base: 1, aliases: ['ml', 'mililitro', 'mililitros', 'cc', 'cm3'] },
  { id: 'cl', one: 'cl', many: 'cl', kind: 'volume', base: 10, aliases: ['cl', 'centilitro', 'centilitros'] },
  { id: 'dl', one: 'dl', many: 'dl', kind: 'volume', base: 100, aliases: ['dl', 'decilitro', 'decilitros'] },
  { id: 'l', one: 'l', many: 'l', kind: 'volume', base: 1000, aliases: ['l', 'lt', 'lts', 'litro', 'litros', 'liter', 'liters', 'litre'] },
  { id: 'taza', one: 'taza', many: 'tazas', kind: 'volume', base: 240, aliases: ['taza', 'tazas', 'cup', 'cups', 'c'] },
  { id: 'cda', one: 'cda', many: 'cdas', kind: 'volume', base: 15, aliases: ['cda', 'cdas', 'cucharada', 'cucharadas', 'cucharada sopera', 'cucharadas soperas', 'c s', 'cs', 'tbsp', 'tablespoon', 'tablespoons', 'tbs'] },
  { id: 'cdta', one: 'cdta', many: 'cdtas', kind: 'volume', base: 5, aliases: ['cdta', 'cdtas', 'cdita', 'cditas', 'cucharadita', 'cucharaditas', 'cucharadita de cafe', 'cucharaditas de cafe', 'c c', 'cc cafe', 'tsp', 'teaspoon', 'teaspoons'] },
  { id: 'floz', one: 'fl oz', many: 'fl oz', kind: 'volume', base: 29.5735, aliases: ['fl oz', 'floz', 'onza liquida', 'onzas liquidas'] },
  { id: 'vaso', one: 'vaso', many: 'vasos', kind: 'volume', base: 200, aliases: ['vaso', 'vasos'] },
  { id: 'chorrito', one: 'chorrito', many: 'chorritos', kind: 'vague', base: 10, aliases: ['chorrito', 'chorritos', 'chorro', 'chorreon', 'splash'] },
  { id: 'pizca', one: 'pizca', many: 'pizcas', kind: 'vague', base: 0.5, aliases: ['pizca', 'pizcas', 'pellizco', 'pinch'] },
  { id: 'punado', one: 'puñado', many: 'puñados', kind: 'vague', base: 30, aliases: ['punado', 'punados', 'handful'] },
  { id: 'diente', one: 'diente', many: 'dientes', kind: 'count', aliases: ['diente', 'dientes', 'clove', 'cloves'] },
  { id: 'hoja', one: 'hoja', many: 'hojas', kind: 'count', aliases: ['hoja', 'hojas'] },
  { id: 'lata', one: 'lata', many: 'latas', kind: 'count', base: 400, aliases: ['lata', 'latas', 'bote', 'botes', 'can', 'cans'] },
  { id: 'sobre', one: 'sobre', many: 'sobres', kind: 'count', aliases: ['sobre', 'sobres', 'sobrecito', 'sachet'] },
  { id: 'rodaja', one: 'rodaja', many: 'rodajas', kind: 'count', aliases: ['rodaja', 'rodajas', 'loncha', 'lonchas', 'rebanada', 'rebanadas', 'slice', 'slices'] },
  { id: 'rama', one: 'rama', many: 'ramas', kind: 'count', aliases: ['rama', 'ramas', 'ramita', 'ramitas', 'manojo', 'manojos'] },
  { id: 'ud', one: 'ud', many: 'uds', kind: 'count', aliases: ['ud', 'uds', 'unidad', 'unidades', 'u', 'pieza', 'piezas', 'pza', 'pc', 'pcs'] },
]

const UNIT_BY_ID = new Map(UNITS.map((u) => [u.id, u]))
const ALIAS = UNITS.flatMap((u) => u.aliases.map((a) => ({ alias: a, unit: u }))).sort(
  (a, b) => b.alias.length - a.alias.length,
)

export const getUnit = (id: string) => UNIT_BY_ID.get(id)

/** Lee un texto que empieza por una unidad. Devuelve unidad y lo que sobra. */
export function readUnit(text: string): { unit: UnitDef; rest: string } | null {
  const t = normalize(text.replace(/\//g, ' '))
  for (const { alias, unit } of ALIAS) {
    if (t === alias || t.startsWith(alias + ' ')) {
      // Recorta del texto original el mismo número de palabras que tiene el alias.
      const words = alias.split(' ').length
      const original = text.replace(/\//g, ' ').trim().split(/\s+/)
      return { unit, rest: original.slice(words).join(' ') }
    }
  }
  return null
}

export function normalizeUnit(raw: string): string {
  if (!raw) return ''
  const hit = readUnit(raw)
  return hit && hit.rest === '' ? hit.unit.id : raw.trim()
}

/** Gramos aproximados de una cantidad. null si no se puede saber. */
export function toGrams(qty: number | null, unitId: string, name: string, food: Food | undefined = matchFood(name)): number | null {
  if (qty == null) return null
  const unit = getUnit(unitId)
  if (!unit) {
    // Sin unidad: piezas ("3 huevos")
    return food?.unit ? qty * food.unit : null
  }
  switch (unit.kind) {
    case 'mass':
      return qty * unit.base!
    case 'volume':
      return qty * unit.base! * (food?.density ?? 1)
    case 'vague':
      return qty * unit.base!
    case 'count':
      if (unit.id === 'sobre') {
        if (food?.key === 'levadura-quimica') return qty * 16
        if (food?.key === 'levadura-seca') return qty * 7
        if (food?.key === 'gelatina') return qty * 10
        return null
      }
      if (unit.id === 'lata') return qty * 400
      if (unit.id === 'diente') return qty * 5
      if (unit.id === 'hoja' && food?.key === 'gelatina') return qty * 2
      if (unit.id === 'rodaja') return qty * 20
      return food?.unit ? qty * food.unit : null
  }
}

export function unitLabel(unitId: string, qty: number | null) {
  const u = getUnit(unitId)
  if (!u) return unitId
  return qty != null && Math.abs(qty) > 1 ? u.many : u.one
}

const FRACTIONS: [number, string][] = [
  [0.25, '¼'],
  [0.333, '⅓'],
  [0.5, '½'],
  [0.666, '⅔'],
  [0.75, '¾'],
]

/** Formatea según la unidad: gramos enteros, especias con decimal, piezas con fracciones. */
export function formatQty(qty: number | null, unitId: string): string {
  if (qty == null) return ''
  const u = getUnit(unitId)
  const kind = u?.kind ?? 'count'
  if (kind === 'mass' || (kind === 'volume' && (unitId === 'ml' || unitId === 'cl' || unitId === 'dl'))) {
    if (unitId === 'kg' || unitId === 'l') return fmtNum(round(qty, qty < 10 ? 2 : 1))
    if (qty >= 500) return fmtNum(Math.round(qty / 5) * 5)
    if (qty >= 20) return fmtNum(Math.round(qty))
    if (qty >= 1) return fmtNum(round(qty, 1))
    return fmtNum(round(qty, 2))
  }
  // Piezas, tazas, cucharadas: fracciones de cocina
  const whole = Math.floor(qty + 0.04)
  const frac = qty - whole
  if (frac < 0.12) return whole ? String(whole) : fmtNum(round(qty, 2))
  const best = FRACTIONS.reduce((a, b) => (Math.abs(b[0] - frac) < Math.abs(a[0] - frac) ? b : a))
  if (frac > 0.88) return String(whole + 1)
  return whole ? `${whole} ${best[1]}` : best[1]
}

export const round = (n: number, d = 0) => {
  const p = 10 ** d
  return Math.round(n * p) / p
}

export const fmtNum = (n: number) => n.toLocaleString('es-ES', { maximumFractionDigits: 2 })

// ---------- Conversor ----------

export const MASS_UNITS = ['g', 'kg', 'oz', 'lb'] as const
export const VOLUME_UNITS = ['ml', 'l', 'taza', 'cda', 'cdta', 'floz'] as const

export function convert(value: number, from: string, to: string, density = 1): number | null {
  const a = getUnit(from)
  const b = getUnit(to)
  if (!a || !b || a.base == null || b.base == null) return null
  let grams: number
  if (a.kind === 'mass') grams = value * a.base
  else if (a.kind === 'volume') grams = value * a.base * density
  else return null
  if (b.kind === 'mass') return grams / b.base
  if (b.kind === 'volume') return grams / density / b.base
  return null
}

export const cToF = (c: number) => (c * 9) / 5 + 32
export const fToC = (f: number) => ((f - 32) * 5) / 9

/** Marca de gas británica más cercana a una temperatura en °C. */
export function gasMark(c: number): string {
  const marks: [number, string][] = [
    [120, '½'],
    [140, '1'],
    [150, '2'],
    [165, '3'],
    [180, '4'],
    [190, '5'],
    [200, '6'],
    [220, '7'],
    [230, '8'],
    [240, '9'],
  ]
  if (c < 110 || c > 260) return '—'
  return marks.reduce((a, b) => (Math.abs(b[0] - c) < Math.abs(a[0] - c) ? b : a))[1]
}

// ---------- Moldes ----------

export type Pan = { shape: 'redondo'; d: number } | { shape: 'rectangular'; w: number; h: number }

export const panArea = (p: Pan) => (p.shape === 'redondo' ? Math.PI * (p.d / 2) ** 2 : p.w * p.h)

export const panFactor = (from: Pan, to: Pan) => panArea(to) / panArea(from)
