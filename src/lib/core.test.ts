import { describe, expect, it } from 'vitest'
import { computeDough, DEFAULT_DOUGH, freshYeastPct } from './dough'
import { matchFood } from './foods'
import { extractJsonLdRecipe, isoMinutes, parseTextRecipe } from './importers'
import { nutrition } from './nutrition'
import { detectTimers, parseIngredientLine } from './parse'
import { bakerPercentages, factorForTarget } from './scale'
import { convert, formatQty, panFactor, toGrams } from './units'

const p = (s: string) => parseIngredientLine(s, 'x')

describe('parseIngredientLine', () => {
  it('cantidad, unidad y nombre', () => {
    expect(p('500 g de harina de fuerza')).toMatchObject({ qty: 500, unit: 'g', name: 'Harina de fuerza', isFlour: true })
    expect(p('500g harina')).toMatchObject({ qty: 500, unit: 'g', name: 'Harina' })
    expect(p('1,5 kg de patatas')).toMatchObject({ qty: 1.5, unit: 'kg', name: 'Patatas' })
    expect(p('2 cucharadas de aceite de oliva')).toMatchObject({ qty: 2, unit: 'cda', name: 'Aceite de oliva' })
    expect(p('1/2 taza de azúcar')).toMatchObject({ qty: 0.5, unit: 'taza', name: 'Azúcar' })
    expect(p('1 ½ cdta de sal')).toMatchObject({ qty: 1.5, unit: 'cdta', name: 'Sal' })
    expect(p('3 huevos')).toMatchObject({ qty: 3, unit: '', name: 'Huevos' })
    expect(p('una pizca de sal')).toMatchObject({ qty: 1, unit: 'pizca', name: 'Sal' })
    expect(p('2 dientes de ajo, picados')).toMatchObject({ qty: 2, unit: 'diente', name: 'Ajo', note: 'picados' })
    expect(p('• 2-3 tomates')).toMatchObject({ qty: 3, name: 'Tomates' })
  })
  it('cantidad al final y al gusto', () => {
    expect(p('Harina de fuerza: 500 g')).toMatchObject({ qty: 500, unit: 'g', name: 'Harina de fuerza' })
    expect(p('Sal al gusto')).toMatchObject({ qty: null, name: 'Sal', note: 'al gusto' })
    expect(p('Mozzarella (fior di latte) 200g')).toMatchObject({ qty: 200, unit: 'g', name: 'Mozzarella', note: 'fior di latte' })
  })
})

describe('foods y unidades', () => {
  it('coincidencias por alias más largo', () => {
    expect(matchFood('Harina de almendra')?.key).toBe('almendra')
    expect(matchFood('Leche condensada')?.key).toBe('leche-condensada')
    expect(matchFood('Aceite de oliva virgen extra')?.key).toBe('aceite-oliva')
    expect(matchFood('Fresas')?.key).toBe('fresa')
  })
  it('a gramos', () => {
    expect(toGrams(1, 'taza', 'Harina')).toBeCloseTo(127, 0)
    expect(toGrams(3, '', 'Huevos')).toBe(150)
    expect(toGrams(1, 'cda', 'Aceite de oliva')).toBeCloseTo(13.65, 1)
  })
  it('conversor y moldes', () => {
    expect(convert(1, 'lb', 'g')).toBeCloseTo(453.6, 1)
    expect(convert(240, 'g', 'taza', 1)).toBe(1)
    expect(panFactor({ shape: 'redondo', d: 20 }, { shape: 'redondo', d: 26 })).toBeCloseTo(1.69, 2)
  })
  it('formato', () => {
    expect(formatQty(512.4, 'g')).toBe('510')
    expect(formatQty(3.64, 'g')).toBe('3,6')
    expect(formatQty(1.5, 'cda')).toBe('1 ½')
    expect(formatQty(0.25, 'taza')).toBe('¼')
  })
})

describe('escalado y panadero', () => {
  const list = [p('1000 g harina'), p('650 g agua'), p('28 g sal'), p('2 g levadura fresca')]
  it('% panadero e hidratación', () => {
    const b = bakerPercentages(list)
    expect(b.flour).toBe(1000)
    expect(b.hydration).toBeCloseTo(65)
    expect(b.rows[2].pct).toBeCloseTo(2.8)
  })
  it('factor por peso objetivo', () => {
    expect(factorForTarget(list[0], 750)).toBe(0.75)
  })
})

describe('masa', () => {
  it('cuadra el peso total', () => {
    const r = computeDough(DEFAULT_DOUGH)
    const sum = r.main.reduce((s, l) => s + l.grams, 0)
    expect(sum).toBeCloseTo(1040, 0)
    expect(r.flour).toBeGreaterThan(600)
  })
  it('con poolish sigue cuadrando', () => {
    const r = computeDough({ ...DEFAULT_DOUGH, preferment: 'poolish', prefermentPct: 30 })
    const pre = r.pre!.reduce((s, l) => s + l.grams, 0)
    const rest = r.main.slice(1).reduce((s, l) => s + l.grams, 0)
    expect(pre + rest).toBeCloseTo(1040, 0)
  })
  it('levadura razonable', () => {
    expect(freshYeastPct(8, 22)).toBeCloseTo(0.3, 1)
    expect(freshYeastPct(48, 4)).toBeGreaterThan(0.15)
  })
})

describe('importar', () => {
  it('texto de TikTok', () => {
    const d = parseTextRecipe(`Pizza napolitana en casa 🍕
Ingredientes:
- 500 g harina 00
- 325 ml agua
- 14 g sal
- 1 g levadura fresca
Preparación:
1. Disuelve la levadura en el agua.
2. Amasa 15 minutos y deja reposar 24 h.
#pizza #napolitana`)
    expect(d.title).toBe('Pizza napolitana en casa')
    expect(d.ingredients).toHaveLength(4)
    expect(d.steps).toHaveLength(2)
    expect(d.category).toBe('pizza')
    expect(d.tags).toContain('napolitana')
  })
  it('JSON-LD', () => {
    const html = `<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Recipe","name":"Bizcocho","recipeYield":"8","prepTime":"PT15M","recipeIngredient":["3 huevos","200 g de azúcar"],"recipeInstructions":[{"@type":"HowToStep","text":"Bate."},{"@type":"HowToStep","text":"Hornea 35 minutos."}]}]}</script>`
    const d = extractJsonLdRecipe(html, 'https://x')!
    expect(d.title).toBe('Bizcocho')
    expect(d.servings).toBe(8)
    expect(d.prepMin).toBe(15)
    expect(d.steps).toEqual(['Bate.', 'Hornea 35 minutos.'])
    expect(d.category).toBe('reposteria')
    expect(isoMinutes('PT1H30M')).toBe(90)
  })
  it('temporizadores', () => {
    expect(detectTimers('Hornea 20 min a 200 °C')).toEqual([{ label: '20 min', seconds: 1200 }])
    expect(detectTimers('Deja reposar 1 h 30 min')[0].seconds).toBe(5400)
    expect(detectTimers('Cuece media hora')[0].seconds).toBe(1800)
  })
  it('nutrición', () => {
    const n = nutrition([p('100 g azúcar'), p('Sal al gusto'), p('1 cosa rara')], 2)
    expect(n.total.kcal).toBeCloseTo(387)
    expect(n.perServing.kcal).toBeCloseTo(193.5)
    expect(n.missing).toHaveLength(1)
  })
})
