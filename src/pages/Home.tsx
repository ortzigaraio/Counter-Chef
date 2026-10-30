import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Pizza, Plus, RefreshCw, Swords } from 'lucide-react'
import { LogoMark } from '../components/LogoMark'
import { RecipeTile } from '../components/RecipeTile'
import { OutcomeTag, Stars, useRoast } from '../components/ui'
import { useChallenges, useLogs, useProfile, useRecipes } from '../data/repo'
import { dailyPicks, useCatalog } from '../data/catalog'
import { starPath } from '../brand/logo'
import { daySeed } from '../lib/roasts'
import { points, rankFor, streak } from '../lib/ranks'
import { css } from '../lib/css'
import { CatalogCard } from './Catalog'

function Star() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden>
      <path d={starPath(10, 10.5, 9.5)} fill="currentColor" />
    </svg>
  )
}

export function Home() {
  const recipes = useRecipes()
  const logs = useLogs()
  const challenges = useChallenges()
  const profile = useProfile()
  const r = useRoast()
  const [seed, setSeed] = useState(daySeed())
  const catalog = useCatalog()
  const picks = useMemo(() => (catalog.list ? dailyPicks(catalog.list, 4, daySeed()) : []), [catalog.list])

  const greeting = useMemo(() => r('greeting', {}, daySeed()), [r])
  const rank = rankFor(points(recipes ?? [], logs ?? [], challenges ?? []))
  const days = streak(logs ?? [])
  const open = (challenges ?? []).filter((c) => c.status === 'abierto')
  const last = logs?.[0]
  const name = profile?.name?.trim()

  return (
    <>
      <header className="hero reveal">
        <div className="hero-lockup">
          <Star />
          <LogoMark size={64} />
          <Star />
        </div>
        <h1 className="hero-title">Counter-Chef</h1>
        <p className="hero-sub">
          {greeting.replace(/[?.]$/, '')}
          {name ? `, ${name}` : ''}
          {greeting.endsWith('?') ? '?' : '.'}
        </p>
      </header>

      <nav className="actions" aria-label="Acciones rápidas">
        <Link className="action action--primary" to="/recetas/nueva">
          <Plus size={22} aria-hidden />
          Nueva receta
        </Link>
        <Link className="action" to="/herramientas/masa">
          <Pizza size={22} aria-hidden />
          Masa de pizza
        </Link>
        <Link className="action" to="/recetas?ver=catalogo">
          <BookOpen size={22} aria-hidden />
          Catálogo
        </Link>
      </nav>

      {open.length > 0 && (
        <section className="section">
          <Link to="/pandilla" className="beef-card row between" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="row">
              <Swords size={20} aria-hidden />
              <span>
                <strong>
                  {open.length} {open.length === 1 ? 'pique abierto' : 'piques abiertos'}
                </strong>
                <span className="small muted" style={{ display: 'block' }}>
                  {open[0].direction === 'recibido' ? `${open[0].rival} te ha retado con ${open[0].recipeTitle}` : `Esperando a ${open[0].rival}`}
                </span>
              </span>
            </span>
            <ArrowRight aria-hidden />
          </Link>
        </section>
      )}

      {picks.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="h-sec">Hoy te toca intentar</h2>
            <Link to="/recetas?ver=catalogo" className="small">
              Ver {catalog.list?.length}
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
          <h2 className="h-sec">Tu recetario</h2>
          <Link to="/recetas" className="small">
            Todas
          </Link>
        </div>
        {recipes && recipes.length > 0 ? (
          <div className="rail-tiles">
            {recipes.slice(0, 10).map((rec) => (
              <RecipeTile
                key={rec.id}
                to={`/recetas/${rec.id}`}
                title={rec.title}
                category={rec.category}
                photo={rec.photo}
                minutes={(rec.prepMin ?? 0) + (rec.cookMin ?? 0)}
                meta={`${rec.servings} ${rec.servingsLabel}`}
              />
            ))}
          </div>
        ) : (
          <div className="panel stack">
            <p className="muted">{r('emptyRecipes', {}, daySeed())}</p>
            <div className="row wrap">
              <Link to="/importar" className="btn btn--primary">
                Importar una receta
              </Link>
              <Link to="/recetas?ver=catalogo" className="btn">
                Elegir del catálogo
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="section grid-2" style={css({ '--gap': '12px', alignItems: 'stretch' })}>
        <Link to={last ? `/recetas/${last.recipeId}` : '/diario'} className="panel stack" style={css({ textDecoration: 'none', color: 'inherit', '--gap': '6px' })}>
          <span className="small faint">Última ronda</span>
          {last ? (
            <>
              <strong style={{ lineHeight: 1.25 }}>{last.recipeTitle}</strong>
              <Stars value={last.rating} size={15} />
              <OutcomeTag o={last.outcome} />
            </>
          ) : (
            <span className="small muted">{r('emptyDiary', {}, daySeed())}</span>
          )}
        </Link>
        <Link to="/perfil" className="panel stack" style={css({ textDecoration: 'none', color: 'inherit', '--gap': '6px' })}>
          <span className="small faint">Rango</span>
          <span className="row" style={css({ '--gap': '10px' })}>
            <span className="rank-badge num" aria-hidden style={{ width: 44, height: 40, fontSize: '1rem' }}>
              {rank.index + 1}
            </span>
            <strong style={{ lineHeight: 1.2 }}>{rank.name.split(' · ')[0]}</strong>
          </span>
          <span className="tiny muted">{rank.name.split(' · ')[1]}</span>
          <div className="meter" aria-hidden>
            <i style={{ width: `${Math.max(4, rank.progress * 100)}%` }} />
          </div>
          <span className="tiny faint num">
            {rank.points} pts{days > 1 ? ` · racha de ${days} días` : ''}
          </span>
        </Link>
      </section>

      <section className="section sermon" aria-label="Sermón del chef">
        <p className="sermon-text" key={seed}>
          <span className="reveal" style={{ display: 'block' }}>
            {r('sermon', {}, seed)}
          </span>
        </p>
        <div className="sermon-sign">El Chef</div>
        <button className="btn btn--ghost btn--sm" style={{ marginTop: 12 }} onClick={() => setSeed((s) => s + 1)}>
          <RefreshCw size={14} aria-hidden /> Otro sermón
        </button>
      </section>
    </>
  )
}
