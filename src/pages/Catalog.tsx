import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Clock, Search } from 'lucide-react'
import { CategoryIcon, Empty } from '../components/ui'
import { useCatalog, type CatalogRecipe } from '../data/catalog'
import { useRecipes } from '../data/repo'
import { CATEGORIES, type Category } from '../data/types'
import { normalize } from '../lib/foods'
import { css } from '../lib/css'

const PAGE = 40

export function Catalog() {
  const { list, error } = useCatalog()
  const mine = useRecipes()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<Category | 'todas'>('todas')
  const [limit, setLimit] = useState(PAGE)
  const saved = useMemo(() => new Set((mine ?? []).map((r) => r.catalogSlug).filter(Boolean)), [mine])

  const filtered = useMemo(() => {
    const nq = normalize(q)
    return (list ?? []).filter((rec) => {
      if (cat !== 'todas' && rec.category !== cat) return false
      if (!nq) return true
      const hay = normalize([rec.title, ...rec.tags, ...rec.ingredients.map((i) => i.name)].join(' '))
      return nq.split(' ').every((w) => hay.includes(w))
    })
  }, [list, q, cat])

  if (error)
    return (
      <Empty quip="No he podido cargar el catálogo. Sin conexión ni el chef cocina.">
        <button className="btn" onClick={() => location.reload()}>
          Reintentar
        </button>
      </Empty>
    )
  if (!list) return <p className="muted">Cargando recetas…</p>

  return (
    <>
      <label className="field">
        <span className="sr-only">Buscar en el catálogo</span>
        <div style={{ position: 'relative' }}>
          <Search size={18} aria-hidden style={{ position: 'absolute', left: 14, top: 14, color: 'var(--ink-3)' }} />
          <input
            className="input"
            style={{ paddingLeft: 42 }}
            type="search"
            placeholder={`Busca entre ${list.length} recetas: «masa madre», «sin horno», «garbanzos»…`}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setLimit(PAGE)
            }}
          />
        </div>
      </label>
      <div className="chips" style={{ marginTop: 12 }} role="group" aria-label="Categoría">
        <button className="chip" aria-pressed={cat === 'todas'} onClick={() => setCat('todas')}>
          Todas
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className="chip"
            aria-pressed={cat === c.id}
            onClick={() => {
              setCat(c.id)
              setLimit(PAGE)
            }}
          >
            {c.label} <span className="faint num">{list.filter((r) => r.category === c.id).length}</span>
          </button>
        ))}
      </div>
      <p className="small faint num" style={{ margin: '16px 0 10px' }}>
        {filtered.length} {filtered.length === 1 ? 'receta' : 'recetas'}
      </p>
      {filtered.length === 0 ? (
        <p className="muted" style={{ padding: '24px 0' }}>
          Nada por aquí. Prueba con otro ingrediente o invéntatela y la importas.
        </p>
      ) : (
        <div className="cgrid">
          {filtered.slice(0, limit).map((rec) => (
            <CatalogCard key={rec.slug} rec={rec} saved={saved.has(rec.slug)} />
          ))}
        </div>
      )}
      {filtered.length > limit && (
        <button className="btn btn--block" style={{ marginTop: 16 }} onClick={() => setLimit((l) => l + PAGE)}>
          Ver {Math.min(PAGE, filtered.length - limit)} más
        </button>
      )}
      <p className="tiny faint" style={{ marginTop: 20 }}>
        Fotos de Wikimedia Commons con licencias libres; autor y licencia en cada receta.
      </p>
    </>
  )
}

export function CatalogCard({ rec, saved }: { rec: CatalogRecipe; saved?: boolean }) {
  const mins = (rec.prepMin ?? 0) + (rec.cookMin ?? 0)
  return (
    <Link to={`/catalogo/${rec.slug}`} className="ccard" data-cat={rec.category}>
      <span className="ccard-img">
        {rec.photo ? <img src={rec.photo} alt="" loading="lazy" decoding="async" /> : <CategoryIcon c={rec.category} size={34} />}
        {saved && (
          <span className="ccard-saved" aria-label="Ya está en tu recetario">
            <Check size={14} aria-hidden />
          </span>
        )}
      </span>
      <span className="ccard-body">
        <span className="ccard-title">{rec.title}</span>
        <span className="rmeta num" style={css({ marginTop: 4 })}>
          {mins > 0 && (
            <span className="row" style={{ gap: 3 }}>
              <Clock size={12} aria-hidden /> {mins < 120 ? `${mins} min` : `${Math.round(mins / 60)} h`}
            </span>
          )}
          <span>{rec.ingredients.length} ingr.</span>
        </span>
      </span>
    </Link>
  )
}
