import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Eye, EyeOff, FileDown, KeyRound, Smartphone, Trash2 } from 'lucide-react'
import { Avatar, Sheet, useToast } from '../components/ui'
import { db } from '../data/db'
import { exportAll, updateProfile, useChallenges, useLogs, useProfile, useRecipes } from '../data/repo'
import { points, RANKS, rankFor, threshold } from '../lib/ranks'
import { downloadFile } from '../lib/share'
import { isoDate } from '../lib/ranks'
import { fmtNum, round } from '../lib/units'
import { css } from '../lib/css'

const HUES = [18, 42, 150, 200, 225, 275, 330]

type InstallEvent = Event & { prompt: () => Promise<void> }

export function ProfilePage() {
  const profile = useProfile()
  const recipes = useRecipes()
  const logs = useLogs()
  const challenges = useChallenges()
  const toast = useToast()
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [wipe, setWipe] = useState(false)
  const [install, setInstall] = useState<InstallEvent | null>(null)

  useEffect(() => {
    if (profile) {
      setName(profile.name)
      setKey(profile.anthropicKey ?? '')
    }
  }, [profile?.name, profile?.anthropicKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const on = (e: Event) => {
      e.preventDefault()
      setInstall(e as InstallEvent)
    }
    window.addEventListener('beforeinstallprompt', on)
    return () => window.removeEventListener('beforeinstallprompt', on)
  }, [])

  useEffect(() => {
    if (location.hash.endsWith('#ia')) document.getElementById('ia')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  if (!profile) return null
  const pts = points(recipes ?? [], logs ?? [], challenges ?? [])
  const rank = rankFor(pts)
  const avg = logs?.length ? logs.reduce((s, l) => s + l.rating, 0) / logs.length : 0
  const disasters = logs?.filter((l) => l.outcome === 'desastre').length ?? 0

  return (
    <div className="stack" style={css({ '--gap': '18px' })}>
      <div className="row" style={{ marginTop: 12 }}>
        <Avatar name={profile.name || 'Tú'} hue={profile.hue} size="lg" />
        <div className="grow">
          <h1 className="h-sec" style={{ fontSize: '1.8rem' }}>
            {profile.name || 'Sin nombre'}
          </h1>
          <p className="small muted">{rank.name}</p>
        </div>
      </div>

      <form
        className="stack"
        style={css({ '--gap': '10px' })}
        onSubmit={(e) => {
          e.preventDefault()
          updateProfile({ name: name.trim() })
          toast('Guardado. Ahora todos sabrán quién quemó el arroz.')
        }}
      >
        <label className="field">
          <span className="label">Tu nombre (lo ven tus amigos en los retos)</span>
          <div className="row">
            <input className="input grow" value={name} onChange={(e) => setName(e.target.value)} placeholder="Chef Bomba" />
            <button className="btn btn--ink" disabled={name.trim() === profile.name}>
              Guardar
            </button>
          </div>
        </label>
        <div className="row" role="radiogroup" aria-label="Color" style={css({ '--gap': '8px' })}>
          {HUES.map((h) => (
            <button
              key={h}
              type="button"
              role="radio"
              aria-checked={profile.hue === h}
              aria-label={`Color ${h}`}
              onClick={() => updateProfile({ hue: h })}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: profile.hue === h ? '3px solid var(--ink)' : '1px solid var(--line)',
                background: `hsl(${h} 85% 70%)`,
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </form>

      <section className="panel stack" style={css({ '--gap': '12px' })}>
        <div className="rank">
          <span className="rank-badge num">{rank.index + 1}</span>
          <div>
            <div className="rank-name">{rank.name}</div>
            <div className="small muted num">
              {pts} pts{rank.next ? ` · siguiente a ${rank.next}` : ''}
            </div>
            <div className="meter" aria-hidden>
              <i style={{ width: `${Math.max(4, rank.progress * 100)}%` }} />
            </div>
          </div>
        </div>
        <div className="grid-3 num">
          <div>
            <div className="conv-out">{recipes?.length ?? 0}</div>
            <span className="small muted">recetas</span>
          </div>
          <div>
            <div className="conv-out">{logs?.length ?? 0}</div>
            <span className="small muted">rondas</span>
          </div>
          <div>
            <div className="conv-out">{avg ? fmtNum(round(avg, 1)) : '—'}</div>
            <span className="small muted">nota media</span>
          </div>
        </div>
        {disasters > 0 && <p className="small muted">{disasters} desastres oficiales. Llevamos la cuenta, no lo dudes.</p>}
        <details>
          <summary className="small" style={{ cursor: 'pointer', fontWeight: 650 }}>
            Todos los rangos
          </summary>
          <ol className="small" style={{ paddingLeft: 22, margin: '10px 0 0', lineHeight: 1.9 }}>
            {RANKS.map((n, i) => (
              <li key={n} style={{ fontWeight: i === rank.index ? 800 : 400, color: i > rank.index ? 'var(--ink-3)' : undefined }}>
                {n} <span className="faint num">· {threshold(i)} pts</span>
              </li>
            ))}
          </ol>
          <p className="tiny faint" style={{ marginTop: 8 }}>
            Puntos: 10 por cada vez que cocinas, ±4 por estrella sobre o bajo el 3, 4 extra si la clavas, 3 por receta guardada y 15 por reto ganado.
          </p>
        </details>
      </section>

      <section className="stack" style={css({ '--gap': '10px' })}>
        <h2 className="h-sec">Nivel de vacile</h2>
        <div className="seg" role="group" aria-label="Nivel de vacile">
          <button aria-pressed={profile.roastLevel === 'suave'} onClick={() => updateProfile({ roastLevel: 'suave' })}>
            Suave
          </button>
          <button aria-pressed={profile.roastLevel === 'picante'} onClick={() => updateProfile({ roastLevel: 'picante' })}>
            Picante
          </button>
        </div>
        <h2 className="h-sec" style={{ marginTop: 10 }}>
          Tema
        </h2>
        <div className="seg" role="group" aria-label="Tema">
          {(['auto', 'light', 'dark'] as const).map((t) => (
            <button key={t} aria-pressed={profile.theme === t} onClick={() => updateProfile({ theme: t })}>
              {t === 'auto' ? 'Automático' : t === 'light' ? 'Claro' : 'Oscuro'}
            </button>
          ))}
        </div>
      </section>

      <section id="ia" className="panel stack" style={css({ '--gap': '10px', scrollMarginTop: 80 })}>
        <h2 className="h-sec row">
          <KeyRound size={20} aria-hidden /> Importar con IA
        </h2>
        <p className="small muted">
          Para sacar recetas de vídeos de TikTok, Instagram o webs complicadas, Counter-Chef usa Claude con <b>tu propia clave de API</b>. Se guarda solo en
          este dispositivo y las peticiones van directas de tu móvil a Anthropic. Cada importación cuesta céntimos.{' '}
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">
            Crear una clave
          </a>
          .
        </p>
        <div className="row" style={css({ '--gap': '6px' })}>
          <input
            className="input grow"
            type={showKey ? 'text' : 'password'}
            autoComplete="off"
            spellCheck={false}
            placeholder="sk-ant-…"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            aria-label="Clave de API de Anthropic"
          />
          <button type="button" className="icon-btn" aria-label={showKey ? 'Ocultar clave' : 'Mostrar clave'} onClick={() => setShowKey((s) => !s)}>
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="row">
          <button
            className="btn btn--ink grow"
            disabled={key.trim() === (profile.anthropicKey ?? '')}
            onClick={() => {
              updateProfile({ anthropicKey: key.trim() || undefined })
              toast(key.trim() ? 'Clave guardada. La IA ya está en tu cocina.' : 'Clave borrada.')
            }}
          >
            Guardar clave
          </button>
          {profile.anthropicKey && (
            <button
              className="btn btn--danger"
              onClick={() => {
                setKey('')
                updateProfile({ anthropicKey: undefined })
                toast('Clave borrada.')
              }}
            >
              Borrar
            </button>
          )}
        </div>
      </section>

      <section className="stack" style={css({ '--gap': '10px' })}>
        <h2 className="h-sec">Tus datos</h2>
        <p className="small muted">Todo vive en este dispositivo. Haz copia de vez en cuando: si borras los datos del navegador, adiós recetario.</p>
        {install && (
          <button
            className="btn btn--primary btn--block"
            onClick={async () => {
              await install.prompt()
              setInstall(null)
            }}
          >
            <Smartphone size={18} aria-hidden /> Instalar Counter-Chef
          </button>
        )}
        <button
          className="btn btn--block"
          onClick={async () => {
            const data = await exportAll()
            downloadFile(`counter-chef-${isoDate(new Date())}.json`, JSON.stringify(data, null, 2))
          }}
        >
          <FileDown size={18} aria-hidden /> Descargar copia de seguridad
        </button>
        <Link to="/importar" className="btn btn--block">
          <Download size={18} aria-hidden /> Restaurar una copia
        </Link>
        <button className="btn btn--danger btn--block" onClick={() => setWipe(true)}>
          <Trash2 size={18} aria-hidden /> Borrar todo
        </button>
      </section>

      <p className="tiny faint" style={{ textAlign: 'center' }}>
        Counter-Chef v0.1 · hecho para cocinar regular y vacilar mejor
      </p>

      <Sheet open={wipe} onClose={() => setWipe(false)} title="¿Borrar todo?">
        <p className="muted">Recetas, diario, pandilla y retos. Sin vuelta atrás. Descarga una copia antes si te queda algo de sentido común.</p>
        <div className="row">
          <button className="btn grow" onClick={() => setWipe(false)}>
            Cancelar
          </button>
          <button
            className="btn btn--danger grow"
            onClick={async () => {
              await Promise.all([db.recipes.clear(), db.logs.clear(), db.friends.clear(), db.challenges.clear()])
              setWipe(false)
              toast('Todo borrado. Borrón y cuenta nueva.')
            }}
          >
            Borrar todo
          </button>
        </div>
      </Sheet>
    </div>
  )
}
