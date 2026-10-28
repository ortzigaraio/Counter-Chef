import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Import, Pizza, Plus, RefreshCw } from 'lucide-react'
import { LogoMark } from '../components/LogoMark'
import { CategoryIcon, OutcomeTag, Stars, useRoast } from '../components/ui'
import { useChallenges, useLogs, useProfile, useRecipes } from '../data/repo'
import { daySeed } from '../lib/roasts'
import { points, rankFor, streak } from '../lib/ranks'
import { css } from '../lib/css'
import { dailyPicks, useCatalog } from '../data/catalog'
import { CatalogCard } from './Catalog'

export function Home() {
  const recipes = useRecipes()
  const logs = useLogs()
  const challenges = useChallenges()
  const profile = useProfile()
  const r = useRoast()
  const [seed, setSeed] = useState(daySeed())
  const catalog = useCatalog()
  const picks = useMemo(() => (catalog.list ? dailyPicks(catalog.list, 6, daySeed()) : []), [catalog.list])

  const greeting = useMemo(() => r('greeting', {}, daySeed()), [r])
  const rank = rankFor(points(recipes ?? [], logs ?? [], challenges ?? []))
  const days = streak(logs ?? [])
  const open = (challenges ?? []).filter((c) => c.status === 'abierto')
  const last = logs?.[0]
  const name = profile?.name?.trim()

  return (
    <>
      <h1 className="h-page reveal">
        {greeting.replace(/[?.]$/, '')}
        {name ? `, ${name}` : ''}
        {greeting.endsWith('?') ? '?' : '.'}
      </h1>

      <section className="sermon" aria-label="Sermón del chef">
        <p className="sermon-text" key={seed}>
          <span className="reveal" style={{ display: 'block' }}>
            «{r('sermon', {}, seed)}»
          </span>
        </p>
        <div className="row wrap">
          <span className="small" style={{ fontWeight: 700, marginRight: 'auto' }}>
            — El Chef, {seed === daySeed() ? 'sermón de hoy' : 'otro sermón más'}
          </span>
          <button className="btn btn--ink btn--sm" onClick={() => setSeed((s) => s + 1)}>
            <RefreshCw size={15} aria-hidden /> Otro sermón
          </button>
        </div>
        <div className="sermon-stamp" aria-hidden>
          <LogoMark size={190} />
        </div>
      </section>

      <div className="row wrap" style={css({ marginTop: 18, '--gap': '8px' })}>
        <Link className="btn btn--ink" to="/importar">
          <Import size={18} aria-hidden /> Importar receta
        </Link>
        <Link className="btn" to="/recetas/nueva">
          <Plus size={18} aria-hidden /> Nueva
        </Link>
        <Link className="btn" to="/herramientas/masa">
          <Pizza size={18} aria-hidden /> Masa de pizza
        </Link>
      </div>

      <section className="section">
        <Link to="/perfil" className="panel rank" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="rank-badge num" aria-hidden>
            {rank.index + 1}
          </span>
          <div>
            <div className="rank-name">{rank.name}</div>
            <div className="small muted num">
              {rank.points} pts{rank.next ? ` · faltan ${rank.next - rank.points} para subir` : ' · rango máximo'}
              {days > 1 ? ` · racha de ${days} días` : ''}
            </div>
            <div className="meter" aria-hidden>
              <i style={{ width: `${Math.max(4, rank.progress * 100)}%` }} />
            </div>
          </div>
        </Link>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="h-sec">En el riel</h2>
          <Link to="/recetas" className="small">
            Todas
          </Link>
        </div>
        {recipes && recipes.length > 0 ? (
          <div className="rail">
            {recipes.slice(0, 8).map((rec, i) => (
              <Link key={rec.id} to={`/recetas/${rec.id}`} className="ticket" data-cat={rec.category}>
                <div className="row between">
                  <span className="ticket-no">#{String(recipes.length - i).padStart(3, '0')}</span>
                  <CategoryIcon c={rec.category} size={18} />
                </div>
                {rec.photo ? <img className="ticket-photo" src={rec.photo} alt="" /> : null}
                <div className="ticket-title">{rec.title}</div>
                <div className="tiny faint num">
                  {rec.ingredients.length} ingredientes · {rec.servings} {rec.servingsLabel}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="panel panel--flat stack">
            <p className="empty-quip" style={{ textAlign: 'left' }}>
              {r('emptyRecipes', {}, daySeed())}
            </p>
            <div className="row wrap">
              <Link to="/importar" className="btn btn--primary">
                Importar la primera <ArrowRight size={16} aria-hidden />
              </Link>
              <Link to="/recetas?ver=catalogo" className="btn">
                Explorar el catálogo
              </Link>
            </div>
          </div>
        )}
      </section>

      {picks.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="h-sec">Hoy te toca intentar</h2>
            <Link to="/recetas?ver=catalogo" className="small">
              {catalog.list?.length} recetas
            </Link>
          </div>
          <div className="cgrid">
            {picks.map((p) => (
              <CatalogCard key={p.slug} rec={p} />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2 className="h-sec">Última ronda</h2>
          <Link to="/diario" className="small">
            Diario
          </Link>
        </div>
        {last ? (
          <Link to={`/recetas/${last.recipeId}`} className="panel stack" style={css({ textDecoration: 'none', color: 'inherit', '--gap': '8px' })}>
            <div className="row between">
              <strong>{last.recipeTitle}</strong>
              <OutcomeTag o={last.outcome} />
            </div>
            <Stars value={last.rating} size={18} />
            {last.review && <p className="muted small">«{last.review}»</p>}
          </Link>
        ) : (
          <p className="muted">{r('emptyDiary', {}, daySeed())}</p>
        )}
      </section>

      {open.length > 0 && (
        <section className="section">
          <Link to="/pandilla" className="beef-card row between" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div>
              <strong>
                {open.length} {open.length === 1 ? 'pique abierto' : 'piques abiertos'}
              </strong>
              <div className="small muted">
                {open[0].direction === 'recibido' ? `${open[0].rival} te ha retado con ${open[0].recipeTitle}` : `Esperando a ${open[0].rival}`}
              </div>
            </div>
            <ArrowRight aria-hidden />
          </Link>
        </section>
      )}
    </>
  )
}
