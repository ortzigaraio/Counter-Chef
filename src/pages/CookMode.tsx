import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ListChecks, Volume2, VolumeX, X } from 'lucide-react'
import { useRoast } from '../components/ui'
import { useRecipe } from '../data/repo'
import { detectTimers } from '../lib/parse'
import { scaleIngredients } from '../lib/scale'
import { formatQty, unitLabel } from '../lib/units'

interface Timer {
  key: string
  label: string
  total: number
  endsAt: number | null
  left: number
  boom: boolean
}

const fmt = (s: number) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function beep() {
  try {
    const ctx = new AudioContext()
    ;[0, 0.25, 0.5].forEach((t) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'square'
      o.frequency.value = 880
      g.gain.setValueAtTime(0.15, ctx.currentTime + t)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2)
      o.connect(g).connect(ctx.destination)
      o.start(ctx.currentTime + t)
      o.stop(ctx.currentTime + t + 0.2)
    })
  } catch {
    /* sin audio, sin drama */
  }
}

export function CookMode() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const factor = Number(params.get('x')) || 1
  const recipe = useRecipe(id)
  const navigate = useNavigate()
  const r = useRoast()
  const [step, setStep] = useState(-1) // -1 = ingredientes
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [timers, setTimers] = useState<Timer[]>([])
  const [speak, setSpeak] = useState(false)
  const quips = useRef<string[]>([])

  // Pantalla siempre encendida mientras cocinas.
  useEffect(() => {
    let lock: WakeLockSentinel | null = null
    const ask = async () => {
      try {
        lock = (await navigator.wakeLock?.request('screen')) ?? null
      } catch {
        lock = null
      }
    }
    ask()
    const vis = () => document.visibilityState === 'visible' && ask()
    document.addEventListener('visibilitychange', vis)
    return () => {
      document.removeEventListener('visibilitychange', vis)
      lock?.release().catch(() => {})
    }
  }, [])

  // Reloj de los temporizadores.
  useEffect(() => {
    const t = setInterval(() => {
      setTimers((list) =>
        list.map((tm) => {
          if (!tm.endsAt) return tm
          const left = Math.max(0, Math.round((tm.endsAt - Date.now()) / 1000))
          if (left === 0 && !tm.boom) {
            beep()
            navigator.vibrate?.([300, 120, 300, 120, 600])
            return { ...tm, left, endsAt: null, boom: true }
          }
          return { ...tm, left }
        }),
      )
    }, 500)
    return () => clearInterval(t)
  }, [])

  const steps = recipe?.steps ?? []
  const ings = useMemo(() => (recipe ? scaleIngredients(recipe.ingredients, factor) : []), [recipe, factor])
  if (recipe && quips.current.length !== steps.length + 1) quips.current = [r('cookStart'), ...steps.map(() => r('cookStep'))]

  const go = useCallback(
    (dir: 1 | -1) => {
      setStep((s) => {
        const next = Math.min(steps.length - 1, Math.max(-1, s + dir))
        return next
      })
    },
    [steps.length],
  )

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') go(1)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'Escape') navigate(-1)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [go, navigate])

  useEffect(() => {
    if (!speak || step < 0 || !steps[step] || !('speechSynthesis' in window)) return
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(steps[step])
    u.lang = 'es-ES'
    speechSynthesis.speak(u)
  }, [speak, step, steps])

  if (!recipe) return null

  const toggleTimer = (key: string, label: string, seconds: number) => {
    setTimers((list) => {
      const tm = list.find((t) => t.key === key)
      if (!tm) return [...list, { key, label, total: seconds, endsAt: Date.now() + seconds * 1000, left: seconds, boom: false }]
      if (tm.boom) return list.filter((t) => t.key !== key)
      if (tm.endsAt) return list.map((t) => (t.key === key ? { ...t, endsAt: null } : t)) // pausa
      return list.map((t) => (t.key === key ? { ...t, endsAt: Date.now() + t.left * 1000 } : t))
    })
  }

  const current = step >= 0 ? steps[step] : null
  const stepTimers = current ? detectTimers(current) : []
  const others = timers.filter((t) => !t.key.startsWith(`${step}:`))
  const isLast = step === steps.length - 1

  return (
    <div className="cook" role="dialog" aria-label={`Modo cocina: ${recipe.title}`}>
      <div className="row between">
        <button className="icon-btn" aria-label="Salir del modo cocina" onClick={() => navigate(`/recetas/${recipe.id}`)}>
          <X size={22} />
        </button>
        <strong className="grow" style={{ textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {recipe.title}
        </strong>
        <button className="icon-btn" aria-label={speak ? 'Dejar de leer en voz alta' : 'Leer en voz alta'} aria-pressed={speak} onClick={() => setSpeak((s) => !s)}>
          {speak ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>
        <button className="icon-btn" aria-label="Ver ingredientes" aria-pressed={step === -1} onClick={() => setStep(-1)}>
          <ListChecks size={22} />
        </button>
      </div>
      <div className="cook-progress" aria-hidden>
        <i data-done="true" />
        {steps.map((_, i) => (
          <i key={i} data-done={i <= step} />
        ))}
      </div>

      {others.length > 0 && (
        <div className="row wrap" style={{ marginTop: 12, gap: 8 }}>
          {others.map((t) => (
            <C4 key={t.key} t={t} onClick={() => toggleTimer(t.key, t.label, t.total)} />
          ))}
        </div>
      )}

      {step === -1 ? (
        <div className="cook-step" style={{ justifyContent: 'flex-start' }}>
          <span className="cook-num">Antes de empezar · mise en place</span>
          <p className="cook-quip" style={{ marginTop: 6 }}>
            {quips.current[0]}
          </p>
          <div className="cook-ings" style={{ marginTop: 12 }}>
            {ings.map((i) => (
              <label key={i.id} className="cook-ing" data-done={checked.has(i.id)}>
                <input
                  type="checkbox"
                  checked={checked.has(i.id)}
                  onChange={() =>
                    setChecked((s) => {
                      const n = new Set(s)
                      if (n.has(i.id)) n.delete(i.id)
                      else n.add(i.id)
                      return n
                    })
                  }
                />
                <span>
                  <b className="num">
                    {i.qty != null ? formatQty(i.qty, i.unit) : ''} {i.qty != null && i.unit ? unitLabel(i.unit, i.qty) : ''}
                  </b>{' '}
                  {i.name}
                  {i.note ? <span style={{ opacity: 0.6 }}> · {i.note}</span> : null}
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="cook-step" key={step}>
          <span className="cook-num num">
            Paso {step + 1} de {steps.length}
          </span>
          <p className="cook-text reveal">{current}</p>
          {stepTimers.length > 0 && (
            <div className="row wrap" style={{ marginTop: 22, gap: 10 }}>
              {stepTimers.map((st, n) => {
                const key = `${step}:${n}`
                const t = timers.find((x) => x.key === key) ?? { key, label: st.label, total: st.seconds, endsAt: null, left: st.seconds, boom: false }
                return <C4 key={key} t={t} onClick={() => toggleTimer(key, st.label, st.seconds)} />
              })}
            </div>
          )}
          <p className="cook-quip">{timers.some((t) => t.boom) ? r('timerDone') : quips.current[step + 1]}</p>
        </div>
      )}

      <div className="cook-nav">
        <button className="btn btn--ghost btn--lg" disabled={step === -1} onClick={() => go(-1)}>
          <ArrowLeft size={20} aria-hidden /> Atrás
        </button>
        {isLast ? (
          <button className="btn btn--primary btn--lg" onClick={() => navigate(`/recetas/${recipe.id}`, { state: { justCooked: true } })}>
            <Check size={20} aria-hidden /> Terminar ronda
          </button>
        ) : (
          <button className="btn btn--primary btn--lg" onClick={() => go(1)} disabled={steps.length === 0}>
            {step === -1 ? 'Empezar' : 'Siguiente'} <ArrowRight size={20} aria-hidden />
          </button>
        )}
      </div>
    </div>
  )
}

function C4({ t, onClick }: { t: Timer; onClick: () => void }) {
  return (
    <button className="c4" data-run={!!t.endsAt} data-boom={t.boom} onClick={onClick} aria-label={`Temporizador ${t.label}: ${t.boom ? 'terminado' : fmt(t.left)}`}>
      <span className="c4-led" aria-hidden />
      <span className="stack" style={{ gap: 0, alignItems: 'flex-start' }}>
        <span className="c4-time">{t.boom ? 'BOOM' : fmt(t.left)}</span>
        <span className="c4-label">{t.boom ? 'toca para cerrar' : t.endsAt ? `${t.label} · toca para pausar` : `${t.label} · toca para plantar`}</span>
      </span>
    </button>
  )
}
