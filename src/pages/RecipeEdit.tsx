import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, ClipboardPaste, ImagePlus, Plus, Save, Trash2, Wheat } from 'lucide-react'
import { compressImage, useRoast, useToast } from '../components/ui'
import { saveRecipe, useRecipe } from '../data/repo'
import { CATEGORIES, type Ingredient } from '../data/types'
import { emptyDraft, type RecipeDraft } from '../lib/importers'
import { uid } from '../lib/id'
import { parseIngredientLine } from '../lib/parse'
import { UNITS } from '../lib/units'
import { css } from '../lib/css'

/** Editor de recetas. Recibe un borrador por `location.state.draft` (importar, calculadora de masa). */
export function RecipeEdit() {
  const { id } = useParams()
  const existing = useRecipe(id)
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const r = useRoast()
  const [d, setD] = useState<RecipeDraft | null>(null)
  const [bulk, setBulk] = useState('')
  const [showBulk, setShowBulk] = useState(false)

  useEffect(() => {
    if (d) return
    const incoming = (location.state as { draft?: RecipeDraft } | null)?.draft
    if (incoming) setD(incoming)
    else if (!id) setD({ ...emptyDraft(), ingredients: [blankIng()], steps: [''] })
    else if (existing) setD(existing)
  }, [d, id, existing, location.state])

  if (!d) return null
  const set = (patch: Partial<RecipeDraft>) => setD({ ...d, ...patch })
  const setIng = (i: number, patch: Partial<Ingredient>) => set({ ingredients: d.ingredients.map((x, n) => (n === i ? { ...x, ...patch } : x)) })
  const move = <T,>(arr: T[], i: number, dir: -1 | 1) => {
    const out = [...arr]
    const j = i + dir
    if (j < 0 || j >= out.length) return out
    ;[out[i], out[j]] = [out[j], out[i]]
    return out
  }

  const save = async () => {
    const clean: RecipeDraft = {
      ...d,
      title: d.title.trim() || 'Receta sin nombre',
      ingredients: d.ingredients.filter((i) => i.name.trim()),
      steps: d.steps.map((s) => s.trim()).filter(Boolean),
      tags: d.tags.map((t) => t.trim().toLowerCase().replace(/^#/, '')).filter(Boolean),
    }
    const saved = await saveRecipe({ ...clean, id: existing?.id })
    toast(r('saved'))
    navigate(`/recetas/${saved.id}`, { replace: true })
  }

  return (
    <form
      className="stack"
      style={css({ '--gap': '18px' })}
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <h1 className="h-page">{id ? 'Editar receta' : 'Nueva receta'}</h1>

      <label className="field">
        <span className="label">Título</span>
        <input className="input" style={{ fontSize: '1.15rem', fontWeight: 650 }} required value={d.title} onChange={(e) => set({ title: e.target.value })} placeholder="Pizza que no se pega a la pala" />
      </label>

      <div className="field">
        <span className="label">Categoría</span>
        <div className="chips" role="group" aria-label="Categoría">
          {CATEGORIES.map((c) => (
            <button type="button" key={c.id} className="chip" aria-pressed={d.category === c.id} onClick={() => set({ category: c.id })}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <label className="field">
          <span className="label">Cantidad</span>
          <input className="input input--num" type="number" min="1" step="1" inputMode="numeric" value={d.servings} onChange={(e) => set({ servings: Math.max(1, Number(e.target.value)) })} />
        </label>
        <label className="field">
          <span className="label">Unidad</span>
          <input className="input" value={d.servingsLabel} onChange={(e) => set({ servingsLabel: e.target.value })} list="cc-yields" />
          <datalist id="cc-yields">
            {['raciones', 'personas', 'bolas', 'pizzas', 'unidades', 'panes', 'porciones'].map((y) => (
              <option key={y} value={y} />
            ))}
          </datalist>
        </label>
        <label className="field">
          <span className="label">Preparación (min)</span>
          <input className="input input--num" type="number" min="0" inputMode="numeric" value={d.prepMin ?? ''} onChange={(e) => set({ prepMin: e.target.value ? Number(e.target.value) : undefined })} />
        </label>
        <label className="field">
          <span className="label">Fuego / horno (min)</span>
          <input className="input input--num" type="number" min="0" inputMode="numeric" value={d.cookMin ?? ''} onChange={(e) => set({ cookMin: e.target.value ? Number(e.target.value) : undefined })} />
        </label>
      </div>

      <section className="stack" style={css({ '--gap': '10px' })}>
        <div className="row between">
          <h2 className="h-sec">Ingredientes</h2>
          <button type="button" className="btn btn--sm btn--ghost" onClick={() => setShowBulk((s) => !s)}>
            <ClipboardPaste size={15} aria-hidden /> Pegar lista
          </button>
        </div>
        {showBulk && (
          <div className="panel panel--flat stack" style={css({ '--gap': '8px' })}>
            <textarea className="textarea" placeholder={'500 g harina de fuerza\n325 ml agua\n10 g sal'} value={bulk} onChange={(e) => setBulk(e.target.value)} />
            <button
              type="button"
              className="btn btn--ink"
              onClick={() => {
                const parsed = bulk
                  .split('\n')
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .map((l) => parseIngredientLine(l, uid()))
                set({ ingredients: [...d.ingredients.filter((i) => i.name.trim()), ...parsed] })
                setBulk('')
                setShowBulk(false)
              }}
            >
              Añadir {bulk.split('\n').filter((l) => l.trim()).length || ''} ingredientes
            </button>
          </div>
        )}
        {d.ingredients.map((ing, i) => (
          <div key={ing.id} className="panel stack" style={css({ padding: 12, '--gap': '8px' })}>
            <div className="row" style={css({ '--gap': '8px' })}>
              <input
                className="input input--num"
                style={{ width: 84 }}
                type="number"
                step="any"
                inputMode="decimal"
                aria-label="Cantidad"
                placeholder="—"
                value={ing.qty ?? ''}
                onChange={(e) => setIng(i, { qty: e.target.value === '' ? null : Number(e.target.value) })}
              />
              <select className="select" style={{ width: 104 }} aria-label="Unidad" value={ing.unit} onChange={(e) => setIng(i, { unit: e.target.value })}>
                <option value="">ud.</option>
                {UNITS.filter((u) => u.id !== 'ud').map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.one}
                  </option>
                ))}
                {ing.unit && !UNITS.some((u) => u.id === ing.unit) && <option value={ing.unit}>{ing.unit}</option>}
              </select>
              <input className="input grow" aria-label="Ingrediente" placeholder="Ingrediente" value={ing.name} onChange={(e) => setIng(i, { name: e.target.value })} />
            </div>
            <div className="row" style={css({ '--gap': '4px' })}>
              <input className="input grow" style={{ minHeight: 38 }} aria-label="Nota" placeholder="Nota (picado, a temperatura ambiente…)" value={ing.note ?? ''} onChange={(e) => setIng(i, { note: e.target.value || undefined })} />
              <button type="button" className="icon-btn" aria-label="Es harina (base del % panadero)" aria-pressed={!!ing.isFlour} title="Harina base del % panadero" onClick={() => setIng(i, { isFlour: !ing.isFlour || undefined })}>
                <Wheat size={18} />
              </button>
              <button type="button" className="icon-btn" aria-label="Subir" onClick={() => set({ ingredients: move(d.ingredients, i, -1) })}>
                <ArrowUp size={18} />
              </button>
              <button type="button" className="icon-btn" aria-label="Bajar" onClick={() => set({ ingredients: move(d.ingredients, i, 1) })}>
                <ArrowDown size={18} />
              </button>
              <button type="button" className="icon-btn" aria-label="Quitar ingrediente" onClick={() => set({ ingredients: d.ingredients.filter((_, n) => n !== i) })}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn--ghost" onClick={() => set({ ingredients: [...d.ingredients, blankIng()] })}>
          <Plus size={16} aria-hidden /> Ingrediente
        </button>
      </section>

      <section className="stack" style={css({ '--gap': '10px' })}>
        <h2 className="h-sec">Pasos</h2>
        {d.steps.map((s, i) => (
          <div key={i} className="row" style={css({ alignItems: 'flex-start', '--gap': '6px' })}>
            <span className="rank-badge" style={{ width: 34, height: 34, borderRadius: 10, fontSize: '0.95rem', marginTop: 6 }} aria-hidden>
              {i + 1}
            </span>
            <textarea className="textarea grow" style={{ minHeight: 70 }} aria-label={`Paso ${i + 1}`} value={s} onChange={(e) => set({ steps: d.steps.map((x, n) => (n === i ? e.target.value : x)) })} />
            <div className="stack" style={css({ '--gap': '0px' })}>
              <button type="button" className="icon-btn" aria-label="Subir paso" onClick={() => set({ steps: move(d.steps, i, -1) })}>
                <ArrowUp size={16} />
              </button>
              <button type="button" className="icon-btn" aria-label="Quitar paso" onClick={() => set({ steps: d.steps.filter((_, n) => n !== i) })}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn--ghost" onClick={() => set({ steps: [...d.steps, ''] })}>
          <Plus size={16} aria-hidden /> Paso
        </button>
        <p className="hint">Escribe los tiempos tal cual ("hornea 20 min") y el modo cocina te pone un temporizador.</p>
      </section>

      <label className="field">
        <span className="label">Etiquetas (separadas por comas)</span>
        <input className="input" value={d.tags.join(', ')} onChange={(e) => set({ tags: e.target.value.split(',') })} placeholder="masa madre, vegana, para impresionar" />
      </label>
      <label className="field">
        <span className="label">Notas</span>
        <textarea className="textarea" value={d.notes ?? ''} onChange={(e) => set({ notes: e.target.value || undefined })} />
      </label>
      <label className="field">
        <span className="label">Fuente (URL)</span>
        <input className="input" type="url" inputMode="url" value={d.sourceUrl ?? ''} onChange={(e) => set({ sourceUrl: e.target.value || undefined })} placeholder="https://" />
      </label>

      <div className="field">
        <span className="label">Foto</span>
        {d.photo && <img src={d.photo} alt="Foto de la receta" style={{ borderRadius: 16, maxHeight: 240, objectFit: 'cover' }} />}
        <div className="row">
          <label className="btn">
            <ImagePlus size={18} aria-hidden /> {d.photo ? 'Cambiar foto' : 'Añadir foto'}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (f) set({ photo: await compressImage(f) })
              }}
            />
          </label>
          {d.photo && (
            <button type="button" className="btn btn--danger" onClick={() => set({ photo: undefined })}>
              Quitar
            </button>
          )}
        </div>
      </div>

      <div className="row" style={{ position: 'sticky', bottom: 'calc(var(--tabbar-h) + var(--safe-b) + 10px)', zIndex: 5 }}>
        <button type="button" className="btn grow" onClick={() => navigate(-1)}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary btn--lg grow">
          <Save size={18} aria-hidden /> Guardar
        </button>
      </div>
    </form>
  )
}

const blankIng = (): Ingredient => ({ id: uid(), qty: null, unit: 'g', name: '' })
