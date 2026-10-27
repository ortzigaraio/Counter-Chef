import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  CalendarCheck,
  ChefHat,
  Clock,
  Copy,
  ExternalLink,
  FileDown,
  Heart,
  Link2,
  Minus,
  Pencil,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Scale,
  Share2,
  Swords,
  Trash2,
  Users,
} from 'lucide-react'
import { Avatar, Empty, OutcomeTag, Sheet, Stars, useRoast, useToast } from '../components/ui'
import { LogSheet } from '../components/LogSheet'
import {
  addFriend,
  deleteLog,
  deleteRecipe,
  getProfile,
  saveChallenge,
  saveRecipe,
  toggleFavorite,
  updateProfile,
  useFriends,
  useRecipe,
  useRecipeLogs,
} from '../data/repo'
import { CATEGORIES, type Ingredient, type Recipe } from '../data/types'
import { NUTRIENT_LABELS, nutrition } from '../lib/nutrition'
import { bakerPercentages, factorForTarget, scaleIngredients, toMetric } from '../lib/scale'
import { challengeLink, downloadFile, recipeLink, recipeToText, shareOrCopy, slug, stripRecipe } from '../lib/share'
import { formatQty, fmtNum, round, toGrams, unitLabel } from '../lib/units'
import { css } from '../lib/css'

type ScaleMode = 'raciones' | 'factor' | 'peso'

export function RecipeDetail() {
  const { id } = useParams()
  const recipe = useRecipe(id)
  const logs = useRecipeLogs(id)
  const navigate = useNavigate()
  const toast = useToast()
  const r = useRoast()

  const [mode, setMode] = useState<ScaleMode>('raciones')
  const [servings, setServings] = useState<number | null>(null)
  const [factorInput, setFactorInput] = useState(1)
  const [targetId, setTargetId] = useState<string>('')
  const [targetGrams, setTargetGrams] = useState(0)
  const [metric, setMetric] = useState(false)
  const [baker, setBaker] = useState(false)
  const [sheet, setSheet] = useState<'log' | 'share' | 'reto' | 'delete' | null>(null)
  const lastFactor = useRef(1)
  const location = useLocation()

  useEffect(() => {
    if ((location.state as { justCooked?: boolean } | null)?.justCooked) {
      setSheet('log')
      toast(r('cookDone'))
      navigate('.', { replace: true, state: null })
    }
  }, [location.state, navigate, toast, r])

  useEffect(() => {
    if (recipe && servings == null) setServings(recipe.servings)
    if (recipe && !targetId) {
      const flour = recipe.ingredients.find((i) => i.isFlour) ?? recipe.ingredients.find((i) => toGrams(i.qty, i.unit, i.name))
      if (flour) {
        setTargetId(flour.id)
        setTargetGrams(Math.round(toGrams(flour.qty, flour.unit, flour.name) ?? 0))
      }
    }
  }, [recipe, servings, targetId])

  const factor = useMemo(() => {
    if (!recipe) return 1
    if (mode === 'raciones') return (servings ?? recipe.servings) / recipe.servings
    if (mode === 'factor') return factorInput > 0 ? factorInput : 1
    const ing = recipe.ingredients.find((i) => i.id === targetId)
    return (ing && factorForTarget(ing, targetGrams)) || 1
  }, [recipe, mode, servings, factorInput, targetId, targetGrams])

  useEffect(() => {
    const prev = lastFactor.current
    if (Math.abs(factor - prev) < 0.001) return
    lastFactor.current = factor
    if (factor >= 2 && prev < 2) toast(r('scaleUp'))
    if (factor <= 0.5 && prev > 0.5) toast(r('scaleDown'))
  }, [factor, toast, r])

  if (recipe === undefined) return null
  if (!recipe)
    return (
      <Empty quip="Esta receta no existe. O la borraste en un ataque de vergüenza.">
        <Link to="/recetas" className="btn">
          Volver a recetas
        </Link>
      </Empty>
    )

  const scaled = scaleIngredients(recipe.ingredients, factor)
  const shown = metric ? toMetric(scaled) : scaled
  const bp = baker ? bakerPercentages(scaled) : null
  const nut = nutrition(scaled, recipe.servings * factor)
  const totalMin = (recipe.prepMin ?? 0) + (recipe.cookMin ?? 0)
  const avg = logs?.length ? logs.reduce((s, l) => s + l.rating, 0) / logs.length : 0

  return (
    <article data-cat={recipe.category}>
      {recipe.photo ? <img className="cover" src={recipe.photo} alt="" /> : <div className="cover-fallback" aria-hidden />}

      <h1 className="title-xl">{recipe.title}</h1>
      <div className="facts num">
        <span>
          <Users size={16} aria-hidden /> {recipe.servings} {recipe.servingsLabel}
        </span>
        {totalMin > 0 && (
          <span>
            <Clock size={16} aria-hidden /> {recipe.prepMin ? `${recipe.prepMin} min prep` : ''}
            {recipe.prepMin && recipe.cookMin ? ' + ' : ''}
            {recipe.cookMin ? `${recipe.cookMin} min fuego` : ''}
          </span>
        )}
        <span>{CATEGORIES.find((c) => c.id === recipe.category)?.label}</span>
        {logs && logs.length > 0 && (
          <span>
            <Stars value={avg} size={15} /> {fmtNum(round(avg, 1))} · {logs.length}×
          </span>
        )}
        {recipe.author && <span>De {recipe.author}</span>}
      </div>
      {recipe.tags.length > 0 && (
        <div className="row wrap" style={css({ '--gap': '6px', marginTop: 8 })}>
          {recipe.tags.map((t) => (
            <span key={t} className="tag">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="row wrap no-print" style={css({ marginTop: 18, '--gap': '8px' })}>
        <Link to={`/recetas/${recipe.id}/cocinar?x=${round(factor, 4)}`} className="btn btn--primary btn--lg">
          <Play size={18} aria-hidden /> Modo cocina
        </Link>
        <button className="btn" onClick={() => setSheet('log')}>
          <CalendarCheck size={18} aria-hidden /> Lo he hecho
        </button>
        <button className="btn btn--ct" onClick={() => setSheet('reto')}>
          <Swords size={18} aria-hidden /> Retar
        </button>
      </div>
      <div className="row wrap no-print" style={css({ marginTop: 8, '--gap': '2px' })}>
        <button className="icon-btn" aria-label="Favorita" aria-pressed={!!recipe.favorite} onClick={() => toggleFavorite(recipe)}>
          <Heart size={20} fill={recipe.favorite ? 'currentColor' : 'none'} />
        </button>
        <button className="icon-btn" aria-label="Compartir o exportar" onClick={() => setSheet('share')}>
          <Share2 size={20} />
        </button>
        <Link className="icon-btn" aria-label="Editar" to={`/recetas/${recipe.id}/editar`}>
          <Pencil size={20} />
        </Link>
        <button
          className="icon-btn"
          aria-label="Duplicar"
          onClick={async () => {
            const copy = await saveRecipe({ ...stripRecipe(recipe), title: `${recipe.title} (copia)`, photo: recipe.photo })
            toast('Duplicada. Ahora puedes estropear la copia sin miedo.')
            navigate(`/recetas/${copy.id}/editar`)
          }}
        >
          <Copy size={20} />
        </button>
        <button className="icon-btn" aria-label="Imprimir" onClick={() => window.print()}>
          <Printer size={20} />
        </button>
        <button className="icon-btn" aria-label="Borrar" onClick={() => setSheet('delete')} style={{ marginLeft: 'auto', color: 'var(--bomba-ink)' }}>
          <Trash2 size={20} />
        </button>
      </div>

      {/* Escalador */}
      <div className="scaler stack" style={css({ '--gap': '10px' })}>
        <div className="row between wrap">
          <div className="seg" role="group" aria-label="Escalar por">
            {(['raciones', 'factor', 'peso'] as ScaleMode[]).map((m) => (
              <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>
                {m === 'raciones' ? 'Raciones' : m === 'factor' ? 'Factor' : 'Por ingrediente'}
              </button>
            ))}
          </div>
          {Math.abs(factor - 1) > 0.001 && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setServings(recipe.servings)
                setFactorInput(1)
                setMode('raciones')
              }}
            >
              <RefreshCw size={14} aria-hidden /> Original
            </button>
          )}
        </div>
        {mode === 'raciones' && (
          <div className="row">
            <div className="stepper">
              <button aria-label="Menos" onClick={() => setServings((s) => Math.max(1, (s ?? recipe.servings) - 1))}>
                <Minus size={18} />
              </button>
              <output aria-live="polite">
                {servings ?? recipe.servings} <span className="small muted">{recipe.servingsLabel}</span>
              </output>
              <button aria-label="Más" onClick={() => setServings((s) => (s ?? recipe.servings) + 1)}>
                <Plus size={18} />
              </button>
            </div>
            <span className="small faint num">×{fmtNum(round(factor, 2))}</span>
          </div>
        )}
        {mode === 'factor' && (
          <div className="row wrap" style={css({ '--gap': '6px' })}>
            {[0.5, 1, 1.5, 2, 3].map((f) => (
              <button key={f} className="chip" aria-pressed={factorInput === f} onClick={() => setFactorInput(f)}>
                ×{fmtNum(f)}
              </button>
            ))}
            <input
              className="input input--num"
              style={{ width: 96 }}
              type="number"
              inputMode="decimal"
              step="0.05"
              min="0.05"
              aria-label="Factor personalizado"
              value={factorInput}
              onChange={(e) => setFactorInput(Number(e.target.value))}
            />
          </div>
        )}
        {mode === 'peso' && (
          <div className="row wrap" style={css({ '--gap': '8px' })}>
            <select
              className="select grow"
              aria-label="Ingrediente de referencia"
              value={targetId}
              onChange={(e) => {
                setTargetId(e.target.value)
                const ing = recipe.ingredients.find((i) => i.id === e.target.value)
                if (ing) setTargetGrams(Math.round(toGrams(ing.qty, ing.unit, ing.name) ?? 0))
              }}
            >
              {recipe.ingredients
                .filter((i) => toGrams(i.qty, i.unit, i.name))
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
            </select>
            <div className="row" style={css({ '--gap': '6px' })}>
              <input
                className="input input--num"
                style={{ width: 110 }}
                type="number"
                inputMode="decimal"
                aria-label="Gramos que tienes"
                value={targetGrams}
                onChange={(e) => setTargetGrams(Number(e.target.value))}
              />
              <span className="muted">g</span>
            </div>
          </div>
        )}
      </div>

      <section className="section">
        <div className="section-head">
          <h2 className="h-sec">Ingredientes</h2>
          <div className="row" style={css({ '--gap': '4px' })}>
            <button className="chip" aria-pressed={metric} onClick={() => setMetric((m) => !m)}>
              <Scale size={14} aria-hidden /> En gramos
            </button>
            <button className="chip" aria-pressed={baker} onClick={() => setBaker((b) => !b)}>
              % panadero
            </button>
          </div>
        </div>
        {bp && bp.flour > 0 && (
          <p className="small muted num" style={{ marginBottom: 6 }}>
            Harina total {fmtNum(Math.round(bp.flour))} g = 100 %
            {bp.hydration ? ` · hidratación ${fmtNum(round(bp.hydration, 1))} %` : ''}
          </p>
        )}
        {bp && bp.flour === 0 && <p className="small muted">Marca qué ingrediente es harina (en Editar) para ver los porcentajes.</p>}
        <ul className="ing-list">
          {shown.map((i, n) => (
            <IngredientRow key={i.id + factor.toFixed(3) + metric} ing={i} pct={bp?.rows[n]?.pct ?? null} changed={Math.abs(factor - 1) > 0.001} />
          ))}
        </ul>
      </section>

      <section className="section">
        <h2 className="h-sec" style={{ marginBottom: 6 }}>
          Pasos
        </h2>
        {recipe.steps.length ? (
          <ol className="steps">
            {recipe.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        ) : (
          <p className="muted">Sin pasos. ¿Lo haces de memoria? Valiente.</p>
        )}
      </section>

      {(recipe.notes || recipe.sourceUrl) && (
        <section className="section">
          <h2 className="h-sec" style={{ marginBottom: 8 }}>
            Notas
          </h2>
          {recipe.notes && <p style={{ whiteSpace: 'pre-line', maxWidth: '68ch' }}>{recipe.notes}</p>}
          {recipe.sourceUrl && (
            <a href={recipe.sourceUrl} target="_blank" rel="noreferrer" className="row small" style={css({ marginTop: 10, '--gap': '6px' })}>
              <ExternalLink size={14} aria-hidden /> Fuente original
            </a>
          )}
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2 className="h-sec">Nutrición por ración</h2>
          <span className="tiny faint">aprox.</span>
        </div>
        <div className="nutri num">
          {NUTRIENT_LABELS.map((n, i) => (
            <div key={n.key} className={i === 0 ? 'is-main' : undefined}>
              <b>{fmtNum(round(nut.perServing[n.key], n.key === 'kcal' ? 0 : 1))}</b>
              <span>
                {n.label} ({n.unit})
              </span>
            </div>
          ))}
        </div>
        <p className="small faint" style={{ marginTop: 8 }}>
          Receta entera: {fmtNum(Math.round(nut.total.kcal))} kcal · {fmtNum(Math.round(nut.grams))} g.{' '}
          {nut.missing.length > 0 && `Sin datos de: ${nut.missing.map((m) => m.name).join(', ')}.`} {r('nutrition', {}, recipe.title.length)}
        </p>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="h-sec">Historial</h2>
          <button className="btn btn--sm" onClick={() => setSheet('log')}>
            <Plus size={14} aria-hidden /> Añadir
          </button>
        </div>
        {logs && logs.length ? (
          logs.map((l) => (
            <div key={l.id} className="log">
              <div className="log-date">
                <b>{Number(l.date.slice(8))}</b>
                <span>{new Date(l.date + 'T12:00').toLocaleDateString('es-ES', { month: 'short' })}</span>
              </div>
              <div className="stack" style={css({ '--gap': '6px' })}>
                <div className="row wrap">
                  <Stars value={l.rating} size={16} />
                  <OutcomeTag o={l.outcome} />
                  {l.scale && Math.abs(l.scale - 1) > 0.01 && <span className="tiny faint num">×{fmtNum(round(l.scale, 2))}</span>}
                  <button className="icon-btn" style={{ marginLeft: 'auto', width: 36, height: 36 }} aria-label="Borrar entrada" onClick={() => deleteLog(l.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
                {l.review && <p className="muted">{l.review}</p>}
                {l.photo && <img src={l.photo} alt="" style={{ borderRadius: 12, maxHeight: 220, objectFit: 'cover' }} />}
              </div>
            </div>
          ))
        ) : (
          <p className="muted">Todavía no la has hecho. Guardarla no cuenta como cocinarla.</p>
        )}
      </section>

      <LogSheet open={sheet === 'log'} onClose={() => setSheet(null)} recipe={recipe} factor={factor} />
      <ShareSheet open={sheet === 'share'} onClose={() => setSheet(null)} recipe={recipe} factor={factor} />
      <ChallengeSheet open={sheet === 'reto'} onClose={() => setSheet(null)} recipe={recipe} lastRating={logs?.[0]?.rating} />
      <Sheet open={sheet === 'delete'} onClose={() => setSheet(null)} title="¿Borrar la receta?">
        <p className="muted">Se borra «{recipe.title}» y su historial. No hay ctrl+Z en la vida.</p>
        <div className="row">
          <button className="btn grow" onClick={() => setSheet(null)}>
            Mejor no
          </button>
          <button
            className="btn btn--danger grow"
            onClick={async () => {
              await deleteRecipe(recipe.id)
              toast(r('deleted'))
              navigate('/recetas')
            }}
          >
            <Trash2 size={16} aria-hidden /> Borrar
          </button>
        </div>
      </Sheet>
    </article>
  )
}

function IngredientRow({ ing, pct, changed }: { ing: Ingredient; pct: number | null; changed: boolean }) {
  return (
    <li className={changed ? 'ing ing-changed' : 'ing'}>
      <span className="ing-qty">
        {ing.qty != null ? formatQty(ing.qty, ing.unit) : '—'}
        {ing.qty != null && ing.unit && <small>{unitLabel(ing.unit, ing.qty)}</small>}
      </span>
      <span>
        {ing.name}
        {ing.note && <span className="ing-note"> · {ing.note}</span>}
      </span>
      <span className="ing-pct">{pct != null ? `${fmtNum(round(pct, 1))} %` : ''}</span>
    </li>
  )
}

function ShareSheet({ open, onClose, recipe, factor }: { open: boolean; onClose: () => void; recipe: Recipe; factor: number }) {
  const toast = useToast()
  const done = (res: string) => {
    if (res === 'copied') toast('Copiado al portapapeles.')
    if (res !== 'cancelled') onClose()
  }
  return (
    <Sheet open={open} onClose={onClose} title="Compartir y exportar">
      <button
        className="btn btn--primary btn--block btn--lg"
        onClick={async () => {
          const me = await getProfile()
          const url = await recipeLink(recipe, me.name || undefined)
          done(await shareOrCopy({ title: recipe.title, text: `Mira esta receta en Counter-Chef: ${recipe.title}`, url }))
        }}
      >
        <Link2 size={18} aria-hidden /> Enlace de la receta
      </button>
      <p className="hint" style={{ marginTop: -8 }}>
        La receta va dentro del enlace: tu amigo la abre y la guarda, sin cuentas ni servidores.
      </p>
      <button className="btn btn--block" onClick={async () => done(await shareOrCopy({ title: recipe.title, text: recipeToText(recipe, factor) }))}>
        <Share2 size={18} aria-hidden /> Texto para WhatsApp {Math.abs(factor - 1) > 0.001 ? `(×${fmtNum(round(factor, 2))})` : ''}
      </button>
      <button
        className="btn btn--block"
        onClick={() => {
          downloadFile(`${slug(recipe.title)}.counterchef.json`, JSON.stringify({ app: 'counter-chef', version: 1, recipes: [recipe] }, null, 2))
          onClose()
        }}
      >
        <FileDown size={18} aria-hidden /> Archivo .json
      </button>
      <button
        className="btn btn--block"
        onClick={() => {
          onClose()
          setTimeout(() => window.print(), 300)
        }}
      >
        <Printer size={18} aria-hidden /> Imprimir o guardar PDF
      </button>
    </Sheet>
  )
}

function ChallengeSheet({ open, onClose, recipe, lastRating }: { open: boolean; onClose: () => void; recipe: Recipe; lastRating?: number }) {
  const friends = useFriends()
  const toast = useToast()
  const r = useRoast()
  const [rival, setRival] = useState('')
  const [rating, setRating] = useState(0)
  const [trash, setTrash] = useState('')
  const [myName, setMyName] = useState('')

  useEffect(() => {
    if (open) {
      getProfile().then((p) => setMyName(p.name))
      setRating(lastRating ?? 0)
      setTrash(r('beef'))
    }
  }, [open, lastRating, r])

  return (
    <Sheet open={open} onClose={onClose} title="Lanzar un reto">
      <p className="muted small">
        Le mandas «{recipe.title}» con tu nota. Cuando la haga, te devuelve la suya con un enlace y se decide quién manda en la cocina.
      </p>
      <label className="field">
        <span className="label">Tu nombre (para que sepa quién le vacila)</span>
        <input className="input" placeholder="Chef Bomba" value={myName} onChange={(e) => setMyName(e.target.value)} />
      </label>
      <label className="field">
        <span className="label">¿A quién?</span>
        <input className="input" list="cc-friends" placeholder="Nombre del rival" value={rival} onChange={(e) => setRival(e.target.value)} />
        <datalist id="cc-friends">
          {friends?.map((f) => (
            <option key={f.id} value={f.name} />
          ))}
        </datalist>
      </label>
      {friends && friends.length > 0 && (
        <div className="row wrap" style={css({ '--gap': '6px' })}>
          {friends.slice(0, 6).map((f) => (
            <button key={f.id} className="chip" aria-pressed={rival === f.name} onClick={() => setRival(f.name)}>
              <Avatar name={f.name} hue={f.hue} /> {f.name}
            </button>
          ))}
        </div>
      )}
      <div className="field">
        <span className="label">Tu nota (la que hay que superar)</span>
        <Stars value={rating} onChange={setRating} />
      </div>
      <label className="field">
        <span className="label">Vacile</span>
        <div className="row" style={css({ '--gap': '6px' })}>
          <input className="input" value={trash} onChange={(e) => setTrash(e.target.value)} />
          <button className="icon-btn" aria-label="Otro vacile" onClick={() => setTrash(r('beef'))}>
            <RefreshCw size={18} />
          </button>
        </div>
      </label>
      <button
        className="btn btn--ct btn--lg btn--block"
        disabled={!rival.trim()}
        onClick={async () => {
          const me = await getProfile()
          if (myName.trim() && myName.trim() !== me.name) {
            await updateProfile({ name: myName.trim() })
            me.name = myName.trim()
          }
          const friend = await addFriend(rival)
          const ch = await saveChallenge({
            recipeId: recipe.id,
            recipeTitle: recipe.title,
            direction: 'enviado',
            rival: friend.name,
            myRating: rating || undefined,
            trash,
            status: 'abierto',
          })
          const url = await challengeLink({
            kind: 'reto',
            challengeId: ch.id,
            from: me.name || 'Un colega',
            rating: rating || undefined,
            trash,
            recipe: stripRecipe(recipe),
          })
          const res = await shareOrCopy({ title: `Reto: ${recipe.title}`, text: `${trash}\n\nReto en Counter-Chef: ${recipe.title}`, url })
          if (res === 'copied') toast('Enlace del reto copiado. Pégaselo donde más le duela.')
          else toast('Reto lanzado. Que empiece el beef.')
          onClose()
        }}
      >
        <ChefHat size={18} aria-hidden /> Enviar reto
      </button>
    </Sheet>
  )
}
