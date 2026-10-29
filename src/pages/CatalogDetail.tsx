import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, BookmarkPlus, Clock, Play, Users } from 'lucide-react'
import { Empty, useRoast, useToast } from '../components/ui'
import { findSaved, saveFromCatalog, useCatalog } from '../data/catalog'
import { CATEGORIES, type Recipe } from '../data/types'
import { formatQty, unitLabel } from '../lib/units'
import { css } from '../lib/css'
import { CatalogCard } from './Catalog'

export function CatalogDetail() {
  const { slug } = useParams()
  const { list, error } = useCatalog()
  const navigate = useNavigate()
  const toast = useToast()
  const r = useRoast()
  const [saved, setSaved] = useState<Recipe | null | undefined>(undefined)
  const rec = list?.find((x) => x.slug === slug)

  useEffect(() => {
    if (slug) findSaved(slug).then((x) => setSaved(x ?? null))
  }, [slug])

  const related = useMemo(
    () => (rec && list ? list.filter((x) => x.category === rec.category && x.slug !== rec.slug && x.photo).slice(0, 6) : []),
    [rec, list],
  )

  if (error) return <Empty quip="No he podido cargar el catálogo. Revisa la conexión." />
  if (!list) return null
  if (!rec)
    return (
      <Empty quip="Esa receta no está en el catálogo. O se la comió alguien.">
        <Link to="/recetas?ver=catalogo" className="btn">
          Volver al catálogo
        </Link>
      </Empty>
    )

  const save = async (then: 'open' | 'cook') => {
    const recipe = await saveFromCatalog(rec)
    if (!saved) toast(r('saved'))
    navigate(then === 'cook' ? `/recetas/${recipe.id}/cocinar` : `/recetas/${recipe.id}`)
  }
  const totalMin = (rec.prepMin ?? 0) + (rec.cookMin ?? 0)

  return (
    <article data-cat={rec.category}>
      {rec.photo ? <img className="cover" src={rec.photo} alt={rec.title} /> : <div className="cover-fallback" aria-hidden />}
      {rec.credit && (
        <p className="tiny faint photo-credit">
          Foto: {rec.credit.author} ·{' '}
          <a href={rec.credit.licenseUrl || rec.credit.source} target="_blank" rel="noreferrer">
            {rec.credit.license}
          </a>{' '}
          ·{' '}
          <a href={rec.credit.source} target="_blank" rel="noreferrer">
            Wikimedia Commons
          </a>
        </p>
      )}

      <h1 className="title-xl">{rec.title}</h1>
      <div className="facts num">
        <span>
          <Users size={16} aria-hidden /> {rec.servings} {rec.servingsLabel}
        </span>
        {totalMin > 0 && (
          <span>
            <Clock size={16} aria-hidden /> {totalMin} min
          </span>
        )}
        <span>{CATEGORIES.find((c) => c.id === rec.category)?.label}</span>
      </div>
      {rec.tags.length > 0 && (
        <div className="row wrap" style={css({ '--gap': '6px', marginTop: 8 })}>
          {rec.tags.map((t) => (
            <span key={t} className="tag">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="row wrap" style={css({ marginTop: 18, '--gap': '8px' })}>
        <button className="btn btn--primary btn--lg" onClick={() => save('cook')}>
          <Play size={18} aria-hidden /> Cocinar ahora
        </button>
        <button className="btn btn--lg" onClick={() => save('open')}>
          <BookmarkPlus size={18} aria-hidden /> {saved ? 'Abrir en mi recetario' : 'Guardar en mi recetario'}
        </button>
      </div>
      <p className="small faint" style={{ marginTop: 8 }}>
        Al guardarla tienes el escalador, el % panadero, la nutrición, el diario y los retos.
      </p>

      <section className="section">
        <h2 className="h-sec" style={{ marginBottom: 6 }}>
          Ingredientes
        </h2>
        <ul className="ing-list">
          {rec.ingredients.map((i) => (
            <li key={i.id} className="ing" style={{ gridTemplateColumns: '92px 1fr' }}>
              <span className="ing-qty">
                {i.qty != null ? formatQty(i.qty, i.unit) : '—'}
                {i.qty != null && i.unit && <small>{unitLabel(i.unit, i.qty)}</small>}
              </span>
              <span>
                {i.name}
                {i.note && <span className="ing-note"> · {i.note}</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2 className="h-sec" style={{ marginBottom: 6 }}>
          Pasos
        </h2>
        <ol className="steps">
          {rec.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>

      {rec.notes && (
        <section className="section">
          <p className="speech">{rec.notes}</p>
        </section>
      )}

      {related.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="h-sec">Más de {CATEGORIES.find((c) => c.id === rec.category)?.label.toLowerCase()}</h2>
            <Link to="/recetas?ver=catalogo" className="small row" style={css({ '--gap': '4px' })}>
              Catálogo <ArrowRight size={12} aria-hidden />
            </Link>
          </div>
          <div className="cgrid">
            {related.map((x) => (
              <CatalogCard key={x.slug} rec={x} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
