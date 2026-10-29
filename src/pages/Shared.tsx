import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Download, Swords } from 'lucide-react'
import { Avatar, Empty, Stars, useRoast, useToast } from '../components/ui'
import { addFriend, getChallenge, saveChallenge, saveRecipe } from '../data/repo'
import { decodePayload, type ChallengePayload, type ResponsePayload, type SharedRecipe } from '../lib/share'
import { formatQty, unitLabel } from '../lib/units'
import { uid } from '../lib/id'
import { verdict } from './Crew'
import { css } from '../lib/css'

function useDecoded<T>() {
  const { data } = useParams()
  const [state, setState] = useState<{ value?: T; error?: boolean }>({})
  useEffect(() => {
    if (!data) return
    decodePayload<T>(data)
      .then((value) => setState({ value }))
      .catch(() => setState({ error: true }))
  }, [data])
  return state
}

const withIds = (r: SharedRecipe) => ({ ...r, ingredients: r.ingredients.map((i) => ({ ...i, id: uid() })), tags: r.tags ?? [], steps: r.steps ?? [] })

function Preview({ r }: { r: SharedRecipe }) {
  return (
    <div className="panel stack" data-cat={r.category} style={css({ '--gap': '10px' })}>
      <h2 className="h-sec">{r.title}</h2>
      <p className="small muted num">
        {r.servings} {r.servingsLabel} · {r.ingredients.length} ingredientes · {r.steps.length} pasos
        {r.author ? ` · de ${r.author}` : ''}
      </p>
      <ul className="ing-list">
        {r.ingredients.slice(0, 8).map((i, n) => (
          <li key={n} className="ing" style={{ gridTemplateColumns: '80px 1fr' }}>
            <span className="ing-qty">
              {i.qty != null ? formatQty(i.qty, i.unit) : '—'} {i.qty != null && i.unit ? <small>{unitLabel(i.unit, i.qty)}</small> : null}
            </span>
            <span>{i.name}</span>
          </li>
        ))}
      </ul>
      {r.ingredients.length > 8 && <p className="small faint">y {r.ingredients.length - 8} más…</p>}
    </div>
  )
}

const Broken = () => (
  <Empty quip="Este enlace está roto. Como tu última bechamel.">
    <Link to="/" className="btn">
      Ir al inicio
    </Link>
  </Empty>
)

export function SharedRecipePage() {
  const { value, error } = useDecoded<SharedRecipe>()
  const navigate = useNavigate()
  const toast = useToast()
  const r = useRoast()
  if (error) return <Broken />
  if (!value) return null
  return (
    <div className="stack" style={css({ '--gap': '16px' })}>
      <h1 className="h-page">Te han pasado una receta</h1>
      <Preview r={value} />
      <button
        className="btn btn--primary btn--lg btn--block"
        onClick={async () => {
          const saved = await saveRecipe(withIds(value))
          if (value.author) await addFriend(value.author)
          toast(r('importOk'))
          navigate(`/recetas/${saved.id}`, { replace: true })
        }}
      >
        <Download size={18} aria-hidden /> Guardar en mi recetario
      </button>
    </div>
  )
}

export function SharedChallengePage() {
  const { value, error } = useDecoded<ChallengePayload>()
  const navigate = useNavigate()
  const toast = useToast()
  if (error || (value && value.kind !== 'reto')) return <Broken />
  if (!value) return null
  return (
    <div className="stack" style={css({ '--gap': '16px' })}>
      <h1 className="h-page">{value.from} te ha retado</h1>
      <div className="beef-card stack" style={css({ '--gap': '12px' })}>
        <div className="row">
          <Avatar name={value.from} hue={220} size="lg" />
          <p className="speech grow">«{value.trash || 'Hazla mejor que yo.'}»</p>
        </div>
        {value.rating ? (
          <div className="row">
            <span className="small muted">Nota a superar</span>
            <Stars value={value.rating} size={20} />
          </div>
        ) : (
          <p className="small muted">Todavía no tiene nota: el primero en hacerla marca el listón.</p>
        )}
      </div>
      <Preview r={value.recipe} />
      <button
        className="btn btn--ct btn--lg btn--block"
        onClick={async () => {
          const existing = await getChallenge(value.challengeId)
          if (existing) {
            navigate(`/recetas/${existing.recipeId}`, { replace: true })
            return
          }
          const saved = await saveRecipe({ ...withIds(value.recipe), author: value.recipe.author ?? value.from })
          const friend = await addFriend(value.from)
          await saveChallenge({
            id: value.challengeId,
            recipeId: saved.id,
            recipeTitle: saved.title,
            direction: 'recibido',
            rival: friend.name,
            rivalRating: value.rating,
            trash: value.trash,
            status: 'abierto',
          })
          toast('Reto aceptado. Cuando la hagas, ve a Pandilla y devuélvele el golpe.')
          navigate(`/recetas/${saved.id}`, { replace: true })
        }}
      >
        <Swords size={18} aria-hidden /> Aceptar el reto
      </button>
    </div>
  )
}

export function SharedResponsePage() {
  const { value, error } = useDecoded<ResponsePayload>()
  const [result, setResult] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!value || value.kind !== 'respuesta') return
    ;(async () => {
      const ch = await getChallenge(value.challengeId)
      if (!ch) return setMissing(true)
      const closed = { ...ch, rivalRating: value.rating, rivalReview: value.review || undefined, status: 'cerrado' as const }
      await saveChallenge(closed)
      setResult(verdict(closed)?.text ?? `${value.from} ha puntuado con un ${value.rating}. Tú aún no tienes nota en este reto.`)
    })()
  }, [value])

  if (error || (value && value.kind !== 'respuesta')) return <Broken />
  if (!value) return null
  return (
    <div className="stack" style={css({ '--gap': '16px' })}>
      <h1 className="h-page">{value.from} ha respondido</h1>
      <div className="beef-card stack" style={css({ '--gap': '10px' })}>
        <strong>{value.recipeTitle}</strong>
        <Stars value={value.rating} size={22} />
        {value.review && <p className="speech">«{value.review}»</p>}
      </div>
      {missing ? (
        <p className="muted">No encuentro ese reto en este dispositivo. ¿Lo lanzaste desde otro móvil?</p>
      ) : (
        result && <p className="h-sec reveal">{result}</p>
      )}
      <Link to="/pandilla" className="btn btn--block">
        Ver la pandilla
      </Link>
    </div>
  )
}
