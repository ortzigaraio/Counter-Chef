import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, RefreshCw, Send, Trash2, UserPlus } from 'lucide-react'
import { Avatar, Empty, Sheet, Stars, useRoast, useToast } from '../components/ui'
import { addFriend, deleteChallenge, deleteFriend, getProfile, saveChallenge, saveLog, useChallenges, useFriends, useProfile } from '../data/repo'
import type { Challenge } from '../data/types'
import { isoDate } from '../lib/ranks'
import { daySeed } from '../lib/roasts'
import { responseLink, shareOrCopy } from '../lib/share'
import { css } from '../lib/css'

export function verdict(c: Challenge) {
  const me = c.myRating ?? 0
  const them = c.rivalRating ?? 0
  if (!me || !them) return null
  if (me > them) return { who: 'yo' as const, text: `Ganas tú, ${me} a ${them}. Que se entere todo el grupo.` }
  if (me < them) return { who: 'rival' as const, text: `Gana ${c.rival}, ${them} a ${me}. Dolorosa derrota en tu propia cocina.` }
  return { who: 'empate' as const, text: `Empate a ${me}. Habrá que repetir… y que esta vez no tiemble el pulso.` }
}

export function Crew() {
  const friends = useFriends()
  const challenges = useChallenges()
  const profile = useProfile()
  const toast = useToast()
  const r = useRoast()
  const [name, setName] = useState('')
  const [answer, setAnswer] = useState<Challenge | null>(null)
  const [roastFor, setRoastFor] = useState<string | null>(null)
  const [line, setLine] = useState('')

  const board = useMemo(() => {
    return (friends ?? [])
      .map((f) => {
        const mine = (challenges ?? []).filter((c) => c.rival === f.name && c.status === 'cerrado')
        const won = mine.filter((c) => verdict(c)?.who === 'yo').length
        const lost = mine.filter((c) => verdict(c)?.who === 'rival').length
        return { f, won, lost, open: (challenges ?? []).filter((c) => c.rival === f.name && c.status === 'abierto').length }
      })
      .sort((a, b) => b.won - b.lost - (a.won - a.lost))
  }, [friends, challenges])

  const open = (challenges ?? []).filter((c) => c.status === 'abierto')
  const closed = (challenges ?? []).filter((c) => c.status === 'cerrado')
  const me = profile?.name || 'Tú'

  return (
    <>
      <h1 className="h-page">Pandilla</h1>
      <p className="lede">Retos por enlace: le mandas una receta con tu nota, la hace, te devuelve la suya. Aquí se decide quién cocina y quién friega.</p>

      <form
        className="row section"
        style={{ marginTop: 18 }}
        onSubmit={async (e) => {
          e.preventDefault()
          if (!name.trim()) return
          await addFriend(name)
          toast(`${name.trim()} añadido. Que empiece el beef.`)
          setName('')
        }}
      >
        <input className="input grow" placeholder="Nombre de tu colega" value={name} onChange={(e) => setName(e.target.value)} aria-label="Nombre del amigo" />
        <button className="btn btn--ct" disabled={!name.trim()}>
          <UserPlus size={18} aria-hidden /> Añadir
        </button>
      </form>

      {(friends?.length ?? 0) === 0 ? (
        <Empty quip={r('emptyCrew', {}, daySeed())} />
      ) : (
        <section className="section">
          <h2 className="h-sec" style={{ marginBottom: 10 }}>
            Marcador
          </h2>
          <div className="rlist">
            {board.map(({ f, won, lost, open: o }) => (
              <div key={f.id} className="ritem" style={{ gridTemplateColumns: '40px 1fr auto' }}>
                <Avatar name={f.name} hue={f.hue} />
                <span>
                  <span className="rtitle">{f.name}</span>
                  <span className="rmeta num">
                    <span>
                      {won} {won === 1 ? 'ganado' : 'ganados'} · {lost} {lost === 1 ? 'perdido' : 'perdidos'}
                    </span>
                    {o > 0 && <span>{o} abiertos</span>}
                  </span>
                </span>
                <span className="row" style={css({ '--gap': '2px' })}>
                  <button
                    className="icon-btn"
                    aria-label={`Vacilar a ${f.name}`}
                    onClick={() => {
                      setRoastFor(f.name)
                      setLine(r('beef'))
                    }}
                  >
                    <Flame size={18} />
                  </button>
                  <button className="icon-btn" aria-label={`Quitar a ${f.name}`} onClick={() => deleteFriend(f.id)}>
                    <Trash2 size={18} />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2 className="h-sec">Piques abiertos</h2>
          <Link to="/recetas" className="small">
            Retar con una receta
          </Link>
        </div>
        {open.length === 0 ? (
          <p className="muted">Ningún pique abierto. Entra en una receta y pulsa «Retar».</p>
        ) : (
          <div className="stack">
            {open.map((c) => (
              <div key={c.id} className="beef-card stack" style={css({ '--gap': '10px' })}>
                <div className="row between">
                  <strong>{c.recipeTitle}</strong>
                  <span className="tag">{c.direction === 'enviado' ? 'Esperando respuesta' : 'Te toca'}</span>
                </div>
                {c.trash && <p className="speech small">«{c.trash}»</p>}
                <Versus me={me} c={c} />
                <div className="row wrap" style={css({ '--gap': '8px' })}>
                  {c.direction === 'recibido' && (
                    <>
                      <Link to={`/recetas/${c.recipeId}`} className="btn btn--sm">
                        Ver receta
                      </Link>
                      <button className="btn btn--ct btn--sm" onClick={() => setAnswer(c)}>
                        <Send size={14} aria-hidden /> Ya la he hecho
                      </button>
                    </>
                  )}
                  <button className="btn btn--ghost btn--sm" style={{ marginLeft: 'auto' }} onClick={() => deleteChallenge(c.id)}>
                    Rendirse
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {closed.length > 0 && (
        <section className="section">
          <h2 className="h-sec" style={{ marginBottom: 10 }}>
            Historial de beef
          </h2>
          <div className="stack">
            {closed.map((c) => (
              <div key={c.id} className="panel stack" style={css({ '--gap': '8px' })}>
                <strong>{c.recipeTitle}</strong>
                <Versus me={me} c={c} />
                <p className="small muted">{verdict(c)?.text}</p>
                {c.rivalReview && <p className="small">«{c.rivalReview}» — {c.rival}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <AnswerSheet c={answer} onClose={() => setAnswer(null)} />

      <Sheet open={!!roastFor} onClose={() => setRoastFor(null)} title={`Vacilar a ${roastFor ?? ''}`}>
        <p className="speech">{line}</p>
        <div className="row">
          <button className="btn grow" onClick={() => setLine(r('beef'))}>
            <RefreshCw size={16} aria-hidden /> Otro
          </button>
          <button
            className="btn btn--ct grow"
            onClick={async () => {
              const res = await shareOrCopy({ title: 'Counter-Chef', text: `${roastFor}: ${line}` })
              if (res === 'copied') toast('Copiado. Ahora pégalo en el grupo.')
              setRoastFor(null)
            }}
          >
            <Send size={16} aria-hidden /> Mandar
          </button>
        </div>
      </Sheet>
    </>
  )
}

function Versus({ me, c }: { me: string; c: Challenge }) {
  return (
    <div className="versus">
      <div className="stack" style={css({ alignItems: 'center', '--gap': '4px' })}>
        <span className="small muted">{me}</span>
        <span className="versus-score num">{c.myRating ?? '?'}</span>
      </div>
      <span className="versus-vs">VS</span>
      <div className="stack" style={css({ alignItems: 'center', '--gap': '4px' })}>
        <span className="small muted">{c.rival}</span>
        <span className="versus-score num">{c.rivalRating ?? '?'}</span>
      </div>
    </div>
  )
}

function AnswerSheet({ c, onClose }: { c: Challenge | null; onClose: () => void }) {
  const toast = useToast()
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  return (
    <Sheet open={!!c} onClose={onClose} title="Devolver el golpe">
      {c && (
        <>
          <p className="muted small">
            {c.rival} sacó un {c.rivalRating ?? '?'}. Pon tu nota con honestidad (o no) y mándale el resultado.
          </p>
          <Stars value={rating} onChange={setRating} />
          <textarea className="textarea" style={{ minHeight: 80 }} placeholder="Tu reseña o tu vacile" value={review} onChange={(e) => setReview(e.target.value)} />
          <button
            className="btn btn--ct btn--lg btn--block"
            disabled={!rating}
            onClick={async () => {
              const me = await getProfile()
              const closed = { ...c, myRating: rating, status: 'cerrado' as const }
              await saveChallenge(closed)
              await saveLog({ recipeId: c.recipeId, recipeTitle: c.recipeTitle, date: isoDate(new Date()), rating, outcome: rating >= 4 ? 'clavada' : rating === 3 ? 'decente' : 'sobrevivible', review: review.trim() })
              const url = await responseLink({ kind: 'respuesta', challengeId: c.id, recipeTitle: c.recipeTitle, from: me.name || 'Tu rival', rating, review: review.trim() })
              const v = verdict(closed)
              const res = await shareOrCopy({ title: `Respuesta: ${c.recipeTitle}`, text: `${v?.who === 'yo' ? 'Te he ganado.' : v?.who === 'rival' ? 'Vale, esta vez ganas tú.' : 'Empate.'} Mi nota: ${rating}/5`, url })
              toast(res === 'copied' ? 'Enlace copiado. Mándaselo.' : v?.text ?? 'Respuesta enviada.')
              setRating(0)
              setReview('')
              onClose()
            }}
          >
            <Send size={18} aria-hidden /> Enviar mi nota
          </button>
        </>
      )}
    </Sheet>
  )
}
