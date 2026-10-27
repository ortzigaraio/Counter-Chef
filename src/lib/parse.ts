import type { Ingredient } from '../data/types'
import { matchFood, normalize } from './foods'
import { readUnit } from './units'

const UNICODE_FRAC: Record<string, number> = {
  '½': 0.5,
  '¼': 0.25,
  '¾': 0.75,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
}

const WORD_NUM: Record<string, number> = {
  un: 1,
  una: 1,
  uno: 1,
  medio: 0.5,
  media: 0.5,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  once: 11,
  doce: 12,
  docena: 12,
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
}

const BULLET = /^[\s\-–—*•·▪◦►▶✓✔☐☑️•]+/u
const NUMBERED = /^\d{1,2}[.)]\s+(?=\D)/

export function cleanLine(line: string) {
  return line.replace(BULLET, '').replace(/\s+/g, ' ').trim()
}

function readNumber(s: string): { value: number; rest: string } | null {
  let t = s.trim()
  // Fracciones unicode pegadas: "1½"
  t = t.replace(/(\d)([½¼¾⅓⅔⅛⅜⅝⅞])/g, '$1 $2')
  const m = t.match(/^(\d+(?:[.,]\d+)?)(?:\s*[-–a]\s*(\d+(?:[.,]\d+)?))?(?:\s+(\d+)\/(\d+))?(?:\s*([½¼¾⅓⅔⅛⅜⅝⅞]))?/)
  if (m && m[0]) {
    const restAfter = t.slice(m[0].length)
    // "1/2" sin entero delante
    const frac = t.match(/^(\d+)\/(\d+)/)
    if (frac) {
      const value = Number(frac[1]) / Number(frac[2])
      return { value, rest: t.slice(frac[0].length) }
    }
    let value = Number(m[1].replace(',', '.'))
    // Rango "2-3": nos quedamos con el valor alto (mejor que falte a que sobre... en cocina, no)
    if (m[2]) value = Number(m[2].replace(',', '.'))
    if (m[3] && m[4]) value += Number(m[3]) / Number(m[4])
    if (m[5]) value += UNICODE_FRAC[m[5]]
    return { value, rest: restAfter }
  }
  const u = t.match(/^([½¼¾⅓⅔⅛⅜⅝⅞])/)
  if (u) return { value: UNICODE_FRAC[u[1]], rest: t.slice(1) }
  const w = t.match(/^([a-záéíóúñ]+)\b/i)
  if (w) {
    const key = normalize(w[1])
    if (key in WORD_NUM && !(key === 'a' && !/^a\s+(?:pinch|cup|handful)/i.test(t))) {
      let value = WORD_NUM[key]
      let rest = t.slice(w[0].length)
      // "una docena de huevos", "un kilo y medio"
      const doc = rest.match(/^\s+docena/i)
      if (doc) {
        value *= 12
        rest = rest.slice(doc[0].length)
      }
      return { value, rest }
    }
  }
  return null
}

const VAGUE = /\b(al gusto|a gusto|c\.?\s?n\.?|cantidad necesaria|lo que pida|opcional|to taste)\b/i

/**
 * "500 g de harina de fuerza (W300)" → { qty: 500, unit: 'g', name: 'harina de fuerza', note: 'W300' }
 */
export function parseIngredientLine(raw: string, id: string): Ingredient {
  let line = cleanLine(raw).replace(NUMBERED, '')
  let note: string | undefined
  const paren = line.match(/\(([^)]*)\)/)
  if (paren) {
    note = paren[1].trim()
    line = line.replace(paren[0], ' ').replace(/\s+/g, ' ').trim()
  }
  if (VAGUE.test(line)) {
    const v = line.match(VAGUE)![0]
    note = [note, v.toLowerCase()].filter(Boolean).join(', ')
    line = line.replace(VAGUE, '').replace(/\s+/g, ' ').trim()
  }

  let qty: number | null = null
  let unit = ''
  let name = line

  const num = readNumber(line)
  if (num) {
    qty = num.value
    let rest = num.rest.trim()
    // "500g" → la unidad viene pegada
    const u = readUnit(rest)
    if (u) {
      unit = u.unit.id
      rest = u.rest
    }
    name = rest.replace(/^(de|del|of)\s+/i, '').trim()
  } else {
    // "Harina de fuerza: 500 g" o "Harina 500g"
    const tail = line.match(/[:\-–]?\s*(\d+(?:[.,]\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+|[½¼¾])\s*([a-zA-Záéíóúñ. ]{0,24})$/)
    if (tail && tail.index! > 0) {
      const n = readNumber(tail[1])
      const u = tail[2] ? readUnit(tail[2].trim()) : null
      if (n && (!tail[2].trim() || (u && u.rest === ''))) {
        qty = n.value
        unit = u?.unit.id ?? ''
        name = line.slice(0, tail.index).replace(/[:\-–]\s*$/, '').trim()
      }
    }
  }

  // "cebolla, picada fina" → nota
  const comma = name.match(/^([^,]+),\s*(.+)$/)
  if (comma) {
    name = comma[1].trim()
    note = [note, comma[2].trim()].filter(Boolean).join(', ')
  }
  name = name.replace(/[.;:]+$/, '').trim()
  // Mayúscula inicial
  if (name) name = name[0].toUpperCase() + name.slice(1)

  const food = matchFood(name)
  return { id, qty, unit, name, note: note || undefined, isFlour: food?.flour || undefined }
}

export function looksLikeIngredient(line: string) {
  const l = cleanLine(line)
  if (!l || l.length > 90) return false
  if (readNumber(l)) return true
  if (VAGUE.test(l)) return true
  if (/\d+\s*(g|gr|kg|ml|l)\b/i.test(l)) return true
  return false
}

/** "hornea 20 min", "1 h 30 min", "media hora" → segundos. */
export function detectTimers(step: string): { label: string; seconds: number }[] {
  const out: { label: string; seconds: number }[] = []
  const text = step.toLowerCase()
  const re = /(\d+(?:[.,]\d+)?)(?:\s*[-–a]\s*(\d+(?:[.,]\d+)?))?\s*(h|hr|hrs|horas?|min|mins|minutos?|seg|segundos?|s)\b(?:\s*(?:y\s*)?(\d+)\s*(min|minutos?))?/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const n = Number((m[2] ?? m[1]).replace(',', '.'))
    const u = m[3]
    let seconds = u.startsWith('h') ? n * 3600 : u.startsWith('m') ? n * 60 : n
    if (m[4]) seconds += Number(m[4]) * 60
    if (seconds >= 10 && seconds <= 72 * 3600) out.push({ label: m[0].trim(), seconds: Math.round(seconds) })
  }
  if (/media hora/.test(text)) out.push({ label: 'media hora', seconds: 1800 })
  if (/un cuarto de hora/.test(text)) out.push({ label: 'un cuarto de hora', seconds: 900 })
  return out
}
