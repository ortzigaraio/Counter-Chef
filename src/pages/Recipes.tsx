import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Clock, Heart, Plus, Search } from 'lucide-react'
import { CategoryIcon, Empty, Stars, useRoast } from '../components/ui'
import { useLogs, useRecipes } from '../data/repo'
import { CATEGORIES, type Category } from '../data/types'
import { normalize } from '../lib/foods'
import { daySeed } from '../lib/roasts'
import { Catalog } from './Catalog'

export function Recipes() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('ver') === 'catalogo' ? 'catalogo' : 'mias'
  const go = (t: 'mias' | 'catalogo') => setParams(t === 'catalogo' ? { ver: 'catalogo' } : {}, { replace: true })
  return (
    <>
      <div className="row between">
        <h1 className="h-page">Recetas</h1>
        <Link to="/recetas/nueva" className="btn btn--ink btn--sm">
          <Plus size={16} aria-hidden /> Nueva
        </Link>
      </div>
      <div className="seg" role="tablist" aria-label="Qué recetas ver" style={{ marginBottom: 12 }}>
        <button role="tab" aria-selected={tab === 'mias'} aria-pressed={tab === 'mias'} onClick={() => go('mias')}>
          Mi recetario
        </button>
        <button role="tab" aria-selected={tab === 'catalogo'} aria-pressed={tab === 'catalogo'} onClick={() => go('catalogo')}>
          Catálogo
        </button>
      </div>
      {tab === 'catalogo' ? <Catalog /> : <MyRecipes onCatalog={() => go('catalogo')} />}
    </>
  )
}

function MyRecipes({ onCatalog }: { onCatalog: () => void }) {
  const recipes = useRecipes()
  const logs = useLogs()
  const r = useRoast()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<Category | 'todas' | 'favs'>('todas')

  const ratings = useMemo(() => {
    const m = new Map<string, { sum: number; n: number }>()
    for (const l of logs ?? []) {
      const e = m.get(l.recipeId) ?? { sum: 0, n: 0 }
      e.sum += l.rating
      e.n++
      m.set(l.recipeId, e)
    }
    return m
  }, [logs])

  const list = useMemo(() => {
    const nq = normalize(q)
    return (recipes ?? []).filter((rec) => {
      if (cat === 'favs' && !rec.favorite) return false
      if (cat !== 'todas' && cat !== 'favs' && rec.category !== cat) return false
      if (!nq) return true
      const hay = normalize([rec.title, ...rec.tags, ...rec.ingredients.map((i) => i.name)].join(' '))
      return nq.split(' ').every((w) => hay.includes(w))
    })
  }, [recipes, q, cat])

  if (recipes && recipes.length === 0)
    return (
      <>
        <Empty quip={r('emptyRecipes', {}, daySeed())}>
          <div className="row wrap" style={{ justifyContent: 'center' }}>
            <Link to="/importar" className="btn">
              Importar receta
            </Link>
            <Link to="/recetas/nueva" className="btn">
              Escribirla a mano
            </Link>
            <button className="btn btn--primary" onClick={onCatalog}>
              Explorar el catálogo
            </button>
          </div>
        </Empty>
      </>
    )

  return (
    <>
      <label className="field" style={{ marginTop: 8 }}>
        <span className="sr-only">Buscar</span>
        <div style={{ position: 'relative' }}>
          <Search size={18} aria-hidden style={{ position: 'absolute', left: 14, top: 14, color: 'var(--ink-3)' }} />
          <input
            className="input"
            style={{ paddingLeft: 42 }}
            type="search"
            placeholder="Título, ingrediente o etiqueta"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </label>

      <div className="chips" style={{ marginTop: 12 }} role="group" aria-label="Filtrar">
        <button className="chip" aria-pressed={cat === 'todas'} onClick={() => setCat('todas')}>
          Todas
        </button>
        <button className="chip" aria-pressed={cat === 'favs'} onClick={() => setCat('favs')}>
          <Heart size={14} aria-hidden /> Favoritas
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className="chip" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <p className="small faint num" style={{ margin: '16px 0 6px' }}>
        {list.length} {list.length === 1 ? 'receta' : 'recetas'}
      </p>
      {list.length === 0 ? (
        <p className="muted" style={{ padding: '24px 0' }}>
          Nada con ese filtro. Igual la receta solo existe en tu imaginación.
        </p>
      ) : (
        <div className="rlist">
          {list.map((rec) => {
            const rt = ratings.get(rec.id)
            const mins = (rec.prepMin ?? 0) + (rec.cookMin ?? 0)
            return (
              <Link key={rec.id} to={`/recetas/${rec.id}`} className="ritem" data-cat={rec.category}>
                <span className="rthumb">{rec.photo ? <img src={rec.photo} alt="" loading="lazy" /> : <CategoryIcon c={rec.category} />}</span>
                <span style={{ minWidth: 0 }}>
                  <span className="rtitle">{rec.title}</span>
                  <span className="rmeta num">
                    <span>{CATEGORIES.find((c) => c.id === rec.category)?.label}</span>
                    {mins > 0 && (
                      <span className="row" style={{ gap: 3 }}>
                        <Clock size={12} aria-hidden /> {mins} min
                      </span>
                    )}
                    {rt ? <span>Hecha {rt.n}×</span> : <span>Sin estrenar</span>}
                  </span>
                </span>
                <span className="stack" style={{ alignItems: 'flex-end', gap: 4 }}>
                  {rec.favorite && <Heart size={16} fill="var(--bomba)" color="var(--bomba)" aria-label="Favorita" />}
                  {rt && <Stars value={rt.sum / rt.n} size={13} />}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
