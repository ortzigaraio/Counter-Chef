import type Anthropic from '@anthropic-ai/sdk'
import { CATEGORIES } from '../data/types'
import { uid } from './id'
import { emptyDraft, guessCategory, type RecipeDraft } from './importers'
import { normalizeUnit } from './units'

/**
 * Importación con Claude. La clave es del propio usuario y se guarda solo en su
 * dispositivo (IndexedDB); las peticiones van directas del navegador a la API.
 */

const MODEL = 'claude-opus-5-5'

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['found', 'title', 'category', 'servings', 'servingsLabel', 'prepMin', 'cookMin', 'ingredients', 'steps', 'tags', 'notes'],
  properties: {
    found: { type: 'boolean', description: 'false si el contenido no contiene ninguna receta' },
    title: { type: 'string' },
    category: { type: 'string', enum: CATEGORIES.map((c) => c.id) },
    servings: { type: 'number' },
    servingsLabel: { type: 'string', description: 'raciones, personas, bolas, pizzas, unidades…' },
    prepMin: { anyOf: [{ type: 'number' }, { type: 'null' }] },
    cookMin: { anyOf: [{ type: 'number' }, { type: 'null' }] },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['qty', 'unit', 'name', 'note', 'isFlour'],
        properties: {
          qty: { anyOf: [{ type: 'number' }, { type: 'null' }] },
          unit: { type: 'string', description: 'g, kg, ml, l, taza, cda, cdta, pizca, diente, lata, sobre, ud o vacío' },
          name: { type: 'string' },
          note: { type: 'string' },
          isFlour: { type: 'boolean', description: 'true si es harina o sémola (base del % panadero)' },
        },
      },
    },
    steps: { type: 'array', items: { type: 'string' } },
    tags: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string', description: 'consejos del autor, trucos o advertencias; vacío si no hay' },
  },
} as const

const SYSTEM = `Extraes recetas de cocina de textos, descripciones de vídeos (TikTok, Instagram, YouTube), notas o páginas web y las devuelves en el esquema JSON indicado.
Reglas:
- Escribe todo en español de España. Traduce si el original está en otro idioma.
- Usa unidades métricas cuando el original las dé; si da tazas o cucharadas, consérvalas (la app las convierte).
- Separa cantidad, unidad y nombre. Números decimales, nunca fracciones en texto.
- Un paso por acción principal, en imperativo y sin numerar.
- No inventes ingredientes ni cantidades. Si el original dice "al gusto", qty = null y note = "al gusto".
- Si se te da un enlace, usa la herramienta web_fetch para leerlo. Si la página no se puede leer, trabaja con el texto que tengas.
- Si no hay ninguna receta, found = false.`

export interface AiResult {
  draft: RecipeDraft | null
  reason?: string
}

export async function aiExtractRecipe(apiKey: string, input: { text?: string; url?: string; title?: string }): Promise<AiResult> {
  const { default: AnthropicClient } = await import('@anthropic-ai/sdk')
  const client = new AnthropicClient({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 })

  const parts = [
    input.title && `Título sugerido: ${input.title}`,
    input.url && `Enlace: ${input.url}`,
    input.text && `Contenido:\n${input.text}`,
  ].filter(Boolean)

  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: 'user', content: parts.join('\n\n') }]
  const tools: Anthropic.Beta.BetaToolUnion[] = input.url ? [{ type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 3 }] : []

  // El servidor reanuda solo tras pause_turn; reenviamos la conversación hasta 3 veces.
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM,
      messages,
      tools,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA as unknown as Record<string, unknown> } },
      fallbacks: 'default',
      betas: ['server-side-fallback-2026-07-01'],
    })

    if (res.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content: res.content as Anthropic.Beta.BetaContentBlockParam[] })
      continue
    }
    if (res.stop_reason === 'refusal') return { draft: null, reason: 'Claude no ha querido procesar ese contenido.' }
    if (res.stop_reason === 'max_tokens') return { draft: null, reason: 'La receta era demasiado larga para procesarla de una vez.' }

    const textBlock = [...res.content].reverse().find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') return { draft: null, reason: 'Claude no devolvió ninguna receta.' }
    return { draft: toDraft(JSON.parse(textBlock.text), input.url) }
  }
  return { draft: null, reason: 'La lectura del enlace tardó demasiado. Prueba pegando el texto.' }
}

interface AiRecipe {
  found: boolean
  title: string
  category: string
  servings: number
  servingsLabel: string
  prepMin: number | null
  cookMin: number | null
  ingredients: { qty: number | null; unit: string; name: string; note: string; isFlour: boolean }[]
  steps: string[]
  tags: string[]
  notes: string
}

function toDraft(r: AiRecipe, url?: string): RecipeDraft | null {
  if (!r.found || !r.ingredients?.length) return null
  const category = CATEGORIES.some((c) => c.id === r.category) ? (r.category as RecipeDraft['category']) : guessCategory(r.title)
  return {
    ...emptyDraft(),
    title: r.title || 'Receta importada',
    category,
    servings: r.servings > 0 ? r.servings : 4,
    servingsLabel: r.servingsLabel || 'raciones',
    prepMin: r.prepMin ?? undefined,
    cookMin: r.cookMin ?? undefined,
    ingredients: r.ingredients.map((i) => ({
      id: uid(),
      qty: i.qty,
      unit: normalizeUnit(i.unit ?? ''),
      name: i.name,
      note: i.note || undefined,
      isFlour: i.isFlour || undefined,
    })),
    steps: r.steps.filter(Boolean),
    tags: r.tags.map((t) => t.toLowerCase()).slice(0, 8),
    notes: r.notes || undefined,
    sourceUrl: url,
  }
}

export function describeAiError(e: unknown): string {
  const status = (e as { status?: number }).status
  if (status === 401) return 'La clave de API no es válida. Revísala en Perfil.'
  if (status === 429) return 'Demasiadas peticiones seguidas. Espera un minuto.'
  if (status && status >= 500) return 'La API de Claude está caída ahora mismo. Inténtalo luego.'
  if (!navigator.onLine) return 'Sin conexión. La IA necesita internet; el parser gratis funciona sin ella.'
  return 'No se pudo hablar con Claude. Comprueba la clave y la conexión.'
}
