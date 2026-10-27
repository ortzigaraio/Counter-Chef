import type { Recipe } from '../data/types'
import { formatQty, unitLabel } from './units'

/**
 * Enlaces autocontenidos: la receta viaja comprimida en la URL (#/r/<datos>),
 * así se comparte sin servidor y funciona aunque el amigo no tenga cuenta.
 */

export type SharedRecipe = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'photo' | 'favorite'>

export interface ChallengePayload {
  kind: 'reto'
  challengeId: string
  from: string
  rating?: number
  trash?: string
  recipe: SharedRecipe
}

export interface ResponsePayload {
  kind: 'respuesta'
  challengeId: string
  recipeTitle: string
  from: string
  rating: number
  review: string
}

const toB64url = (bytes: Uint8Array) => {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const fromB64url = (s: string) => {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4))
  const out = new Uint8Array(b.length)
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i)
  return out
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const res = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream))
  return new Uint8Array(await res.arrayBuffer())
}

const canCompress = () => typeof CompressionStream !== 'undefined'

export async function encodePayload(data: unknown): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(data))
  if (canCompress()) return 'z' + toB64url(await pipe(json, new CompressionStream('deflate-raw')))
  return 'j' + toB64url(json)
}

export async function decodePayload<T>(s: string): Promise<T> {
  const bytes = fromB64url(s.slice(1))
  const raw = s[0] === 'z' ? await pipe(bytes, new DecompressionStream('deflate-raw')) : bytes
  return JSON.parse(new TextDecoder().decode(raw)) as T
}

export function stripRecipe(r: Recipe | SharedRecipe): SharedRecipe {
  const { title, category, servings, servingsLabel, prepMin, cookMin, ingredients, steps, tags, notes, sourceUrl, author } = r as Recipe
  return { title, category, servings, servingsLabel, prepMin, cookMin, ingredients, steps, tags, notes, sourceUrl, author }
}

export const appBase = () => `${location.origin}${location.pathname}`

export async function recipeLink(r: Recipe, author?: string) {
  return `${appBase()}#/r/${await encodePayload({ ...stripRecipe(r), author: r.author ?? author })}`
}

export async function challengeLink(p: ChallengePayload) {
  return `${appBase()}#/reto/${await encodePayload(p)}`
}

export async function responseLink(p: ResponsePayload) {
  return `${appBase()}#/respuesta/${await encodePayload(p)}`
}

export function recipeToText(r: Recipe | SharedRecipe, factor = 1) {
  const lines = [`🍳 ${r.title}`, `${Math.round(r.servings * factor * 10) / 10} ${r.servingsLabel}`, '', 'INGREDIENTES']
  for (const i of r.ingredients) {
    const q = i.qty == null ? '' : `${formatQty(i.qty * factor, i.unit)} ${i.unit ? unitLabel(i.unit, i.qty * factor) + ' ' : ''}`
    lines.push(`• ${q}${i.name}${i.note ? ` (${i.note})` : ''}`)
  }
  lines.push('', 'PASOS')
  r.steps.forEach((s, n) => lines.push(`${n + 1}. ${s}`))
  if (r.notes) lines.push('', `Notas: ${r.notes}`)
  if (r.sourceUrl) lines.push('', `Fuente: ${r.sourceUrl}`)
  lines.push('', '— Counter-Chef')
  return lines.join('\n')
}

/** Comparte con el menú nativo; si no hay, copia al portapapeles. */
export async function shareOrCopy(data: { title: string; text?: string; url?: string }): Promise<'shared' | 'copied' | 'cancelled'> {
  if (navigator.share) {
    try {
      await navigator.share(data)
      return 'shared'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled'
    }
  }
  await navigator.clipboard.writeText([data.text, data.url].filter(Boolean).join('\n\n'))
  return 'copied'
}

export function downloadFile(name: string, content: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'receta'
