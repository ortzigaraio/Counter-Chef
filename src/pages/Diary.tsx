import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { LogSheet } from '../components/LogSheet'
import { Empty, OutcomeTag, Stars, useRoast } from '../components/ui'
import { useLogs, useRecipes } from '../data/repo'
import type { CookLog } from '../data/types'
import { isoDate, streak } from '../lib/ranks'
import { daySeed } from '../lib/roasts'
import { fmtNum, round } from '../lib/units'
import { css } from '../lib/css'

const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function Diary() {
  const logs = useLogs()
  const recipes = useRecipes()
  const r = useRoast()
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [day, setDay] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const today = isoDate(new Date())

  const byDay = useMemo(() => {
    const m = new Map<string, CookLog[]>()
    for (const l of logs ?? []) m.set(l.date, [...(m.get(l.date) ?? []), l])
    return m
  }, [logs])

  const cells = useMemo(() => {
    const first = new Date(month)
    const offset = (first.getDay() + 6) % 7 // lunes primero
    const start = new Date(first)
    start.setDate(1 - offset)
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [month])

  const monthKey = isoDate(month).slice(0, 7)
  const monthLogs = (logs ?? []).filter((l) => l.date.startsWith(monthKey))
  const shown = day ? byDay.get(day) ?? [] : monthLogs
  const avg = monthLogs.length ? monthLogs.reduce((s, l) => s + l.rating, 0) / monthLogs.length : 0
  const disasters = monthLogs.filter((l) => l.outcome === 'desastre').length
  const label = month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  return (
    <>
      <div className="row between">
        <h1 className="h-page">Diario</h1>
        <button className="btn btn--ink btn--sm" disabled={!recipes?.length} onClick={() => setAdding(true)}>
          <Plus size={16} aria-hidden /> Apuntar
        </button>
      </div>

      <div className="grid-3 num" style={{ marginTop: 6 }}>
        <div className="panel panel--flat">
          <div className="conv-out">{monthLogs.length}</div>
          <span className="small muted">rondas este mes</span>
        </div>
        <div className="panel panel--flat">
          <div className="conv-out">{avg ? fmtNum(round(avg, 1)) : '—'}</div>
          <span className="small muted">nota media</span>
        </div>
        <div className="panel panel--flat">
          <div className="conv-out">{streak(logs ?? [])}</div>
          <span className="small muted">días de racha</span>
        </div>
      </div>
      {disasters > 0 && (
        <p className="small muted" style={{ marginTop: 8 }}>
          {disasters} {disasters === 1 ? 'desastre' : 'desastres'} este mes. Los bomberos ya te saludan por tu nombre.
        </p>
      )}

      <section className="panel section" style={{ marginTop: 18 }}>
        <div className="row between" style={{ marginBottom: 10 }}>
          <button className="icon-btn" aria-label="Mes anterior" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
            <ChevronLeft />
          </button>
          <strong style={{ textTransform: 'capitalize' }}>{label}</strong>
          <button className="icon-btn" aria-label="Mes siguiente" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
            <ChevronRight />
          </button>
        </div>
        <div className="cal" role="grid" aria-label={`Calendario de ${label}`}>
          {DOW.map((d) => (
            <div key={d} className="cal-dow" aria-hidden>
              {d}
            </div>
          ))}
          {cells.map((d) => {
            const key = isoDate(d)
            const entries = byDay.get(key) ?? []
            return (
              <button
                key={key}
                className="cal-day"
                data-out={d.getMonth() !== month.getMonth()}
                data-today={key === today}
                aria-pressed={day === key}
                aria-label={`${d.getDate()}: ${entries.length ? `${entries.length} cocinadas` : 'nada'}`}
                onClick={() => setDay(day === key ? null : key)}
              >
                {d.getDate()}
                <span className="cal-dots" aria-hidden>
                  {entries.slice(0, 3).map((e) => (
                    <i key={e.id} data-o={e.outcome} />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="h-sec">{day ? new Date(day + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Este mes'}</h2>
          {day && (
            <button className="btn btn--sm" onClick={() => setAdding(true)} disabled={!recipes?.length}>
              <Plus size={14} aria-hidden /> Este día
            </button>
          )}
        </div>
        {(logs?.length ?? 0) === 0 ? (
          <Empty quip={r('emptyDiary', {}, daySeed())}>
            <Link to="/recetas" className="btn">
              Elegir receta
            </Link>
          </Empty>
        ) : shown.length === 0 ? (
          <p className="muted">Nada cocinado. La cocina ha descansado y, sinceramente, se lo merecía.</p>
        ) : (
          shown.map((l) => (
            <Link key={l.id} to={`/recetas/${l.recipeId}`} className="log" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="log-date">
                <b>{Number(l.date.slice(8))}</b>
                <span>{new Date(l.date + 'T12:00').toLocaleDateString('es-ES', { weekday: 'short' })}</span>
              </div>
              <div className="stack" style={css({ '--gap': '4px' })}>
                <strong>{l.recipeTitle}</strong>
                <div className="row wrap" style={css({ '--gap': '8px' })}>
                  <Stars value={l.rating} size={15} />
                  <OutcomeTag o={l.outcome} />
                </div>
                {l.review && <p className="small muted">{l.review}</p>}
              </div>
            </Link>
          ))
        )}
      </section>

      <LogSheet open={adding} onClose={() => setAdding(false)} date={day ?? undefined} />
    </>
  )
}
