import type { Category, Ingredient, Recipe } from '../data/types'
import { uid } from './id'
import { normalize } from './foods'
import { cleanLine, looksLikeIngredient, parseIngredientLine } from './parse'

export type RecipeDraft = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>

export const emptyDraft = (): RecipeDraft => ({
  title: '',
  category: 'cocina',
  servings: 4,
  servingsLabel: 'raciones',
  ingredients: [],
  steps: [],
  tags: [],
})

export function guessCategory(text: string): Category {
  const t = normalize(text)
  if (/\b(pizza|pizzas|focaccia|calzone|napolitana)\b/.test(t)) return 'pizza'
  if (/\b(pan|panes|baguette|chapata|hogaza|brioche|bollo|bollos|masa madre|croissant|bagel)\b/.test(t)) return 'panaderia'
  if (/\b(tarta|bizcocho|galleta|galletas|cookies|cheesecake|flan|brownie|magdalena|muffin|crema pastelera|tiramisu|postre)\b/.test(t)) return 'reposteria'
  if (/\b(coctel|batido|smoothie|limonada|sangria|cafe|mojito)\b/.test(t)) return 'bebida'
  return 'cocina'
}

const INGREDIENT_HEAD = /^(ingredientes?|ingredients?|necesitas|para la masa|para el relleno|para la salsa|lista de la compra)\b/i
const STEP_HEAD = /^(elaboraci[oó]n|preparaci[oó]n|pasos?|instrucciones|m[eé]todo|procedimiento|c[oó]mo se hace|directions|instructions|method|steps)\b/i
const NOISE = /^(#\w+\s*)+$|^(s[ií]gueme|follow|link in bio|guarda|dale like|comenta)\b/i

/** Convierte texto libre (caption de TikTok/IG, notas, WhatsApp) en receta. */
export function parseTextRecipe(text: string, titleHint?: string): RecipeDraft {
  const draft = emptyDraft()
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  let mode: 'intro' | 'ing' | 'steps' = 'intro'
  const intro: string[] = []
  const tags = new Set<string>()

  for (const raw of lines) {
    for (const h of raw.match(/#[\p{L}\d_]+/gu) ?? []) tags.add(h.slice(1).toLowerCase())
    const line = cleanLine(raw.replace(/#[\p{L}\d_]+/gu, '')).replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u, '')
    if (!line || NOISE.test(line)) continue

    if (INGREDIENT_HEAD.test(line)) {
      mode = 'ing'
      const after = line.replace(INGREDIENT_HEAD, '').replace(/^[\s:\-–]+/, '')
      if (after) splitInline(after).forEach((p) => draft.ingredients.push(parseIngredientLine(p, uid())))
      continue
    }
    if (STEP_HEAD.test(line)) {
      mode = 'steps'
      const after = line.replace(STEP_HEAD, '').replace(/^[\s:\-–]+/, '')
      if (after) draft.steps.push(after)
      continue
    }
    const servings = line.match(/(?:para|raciones|porciones|personas|serves|rinde)\D{0,12}(\d{1,2})|(\d{1,2})\s*(?:raciones|porciones|personas|pizzas|bolas|unidades)/i)
    if (servings && line.length < 40) {
      draft.servings = Number(servings[1] ?? servings[2])
      const label = line.match(/(raciones|porciones|personas|pizzas|bolas|unidades)/i)
      if (label) draft.servingsLabel = label[1].toLowerCase()
      continue
    }

    if (mode === 'intro') {
      if (looksLikeIngredient(line)) {
        mode = 'ing'
        draft.ingredients.push(parseIngredientLine(line, uid()))
      } else intro.push(line)
    } else if (mode === 'ing') {
      if (looksLikeIngredient(line) || line.length < 32) draft.ingredients.push(parseIngredientLine(line, uid()))
      else {
        mode = 'steps'
        draft.steps.push(stripStepNumber(line))
      }
    } else {
      draft.steps.push(stripStepNumber(line))
    }
  }

  draft.title = (titleHint && titleHint.trim()) || intro.shift() || 'Receta importada'
  draft.title = draft.title
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '')
    .replace(/\s*[|·–-]\s*(tiktok|instagram|youtube).*$/i, '')
    .trim()
    .slice(0, 90)
  if (intro.length) draft.notes = intro.join('\n')
  draft.tags = [...tags].slice(0, 8)
  draft.category = guessCategory(`${draft.title} ${draft.tags.join(' ')} ${text.slice(0, 400)}`)
  return draft
}

const stripStepNumber = (s: string) => s.replace(/^(paso\s*)?\d{1,2}\s*[.):\-–]\s*/i, '').trim()

/** "harina 500g, agua 300ml, sal 10g" en una sola línea. */
function splitInline(s: string) {
  return s.split(/\s*[,;]\s*(?=\S)/).filter(Boolean)
}

// ---------- schema.org Recipe (JSON-LD) ----------

type Json = Record<string, unknown>

function findRecipeNode(node: unknown): Json | null {
  if (!node || typeof node !== 'object') return null
  if (Array.isArray(node)) {
    for (const n of node) {
      const r = findRecipeNode(n)
      if (r) return r
    }
    return null
  }
  const obj = node as Json
  const type = obj['@type']
  if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) return obj
  if (obj['@graph']) return findRecipeNode(obj['@graph'])
  return null
}

const text = (v: unknown): string => {
  if (typeof v === 'string') return decodeEntities(v).replace(/<[^>]+>/g, '').trim()
  if (Array.isArray(v)) return text(v[0])
  if (v && typeof v === 'object') return text((v as Json).text ?? (v as Json).name ?? '')
  return ''
}

function decodeEntities(s: string) {
  if (typeof DOMParser === 'undefined' || !s.includes('&')) return s
  // DOMParser no ejecuta scripts: solo traduce entidades (&amp; → &).
  return new DOMParser().parseFromString(s, 'text/html').documentElement.textContent ?? s
}

/** PT1H30M → 90 */
export function isoMinutes(v: unknown): number | undefined {
  if (typeof v !== 'string') return undefined
  const m = v.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/)
  if (!m) return undefined
  const min = Number(m[1] ?? 0) * 1440 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0)
  return min || undefined
}

function flattenSteps(v: unknown): string[] {
  if (!v) return []
  if (typeof v === 'string') return v.split(/\n+/).map((s) => text(s)).filter(Boolean)
  if (Array.isArray(v)) return v.flatMap(flattenSteps)
  const obj = v as Json
  if (obj['@type'] === 'HowToSection') return flattenSteps(obj.itemListElement)
  const t = text(obj.text ?? obj.name)
  return t ? [t] : []
}

export function extractJsonLdRecipe(html: string, url?: string): RecipeDraft | null {
  const scripts = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
  for (const s of scripts) {
    let data: unknown
    try {
      data = JSON.parse(s[1].trim())
    } catch {
      continue
    }
    const r = findRecipeNode(data)
    if (!r) continue
    const yieldText = text(r.recipeYield)
    const servings = Number(yieldText.match(/\d+/)?.[0] ?? 4)
    const ingredients: Ingredient[] = (Array.isArray(r.recipeIngredient) ? r.recipeIngredient : []).map((l: unknown) =>
      parseIngredientLine(text(l), uid()),
    )
    const title = text(r.name) || 'Receta importada'
    const keywords = typeof r.keywords === 'string' ? r.keywords.split(',').map((k) => k.trim().toLowerCase()) : []
    return {
      ...emptyDraft(),
      title,
      servings: servings || 4,
      servingsLabel: /bola|pizza|unidad|pieza/i.test(yieldText) ? yieldText.replace(/\d+\s*/, '').trim() || 'raciones' : 'raciones',
      prepMin: isoMinutes(r.prepTime),
      cookMin: isoMinutes(r.cookTime),
      ingredients,
      steps: flattenSteps(r.recipeInstructions),
      tags: keywords.filter(Boolean).slice(0, 8),
      notes: text(r.description) || undefined,
      sourceUrl: url,
      category: guessCategory(`${title} ${text(r.recipeCategory)} ${keywords.join(' ')}`),
    }
  }
  return null
}

/** Intenta leer la web directamente. Muchas webs lo bloquean (CORS): entonces toca IA o pegar texto. */
export async function fetchRecipeFromUrl(url: string): Promise<RecipeDraft | null> {
  const res = await fetch(url, { mode: 'cors' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()
  return extractJsonLdRecipe(html, url)
}

export function findUrl(s: string): string | undefined {
  return s.match(/https?:\/\/[^\s<>"']+/i)?.[0]
}
