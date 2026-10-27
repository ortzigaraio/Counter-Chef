import { useEffect, useState } from 'react'
import { Sheet, Stars, compressImage, useRoast, useToast } from './ui'
import { saveLog, useProfile, useRecipes } from '../data/repo'
import { OUTCOMES, type Outcome, type Recipe } from '../data/types'
import { isoDate } from '../lib/ranks'
import { ratingRoast } from '../lib/roasts'

/** Apuntar en el diario. Sin `recipe`, deja elegir cuál de tus recetas has hecho. */
export function LogSheet({ open, onClose, recipe, factor = 1, date: initialDate }: { open: boolean; onClose: () => void; recipe?: Recipe; factor?: number; date?: string }) {
  const recipes = useRecipes()
  const [pick, setPick] = useState('')
  const toast = useToast()
  const r = useRoast()
  const profile = useProfile()
  const [date, setDate] = useState(isoDate(new Date()))
  const [rating, setRating] = useState(0)
  const [outcome, setOutcome] = useState<Outcome>('decente')
  const [review, setReview] = useState('')
  const [photo, setPhoto] = useState<string>()
  const target = recipe ?? recipes?.find((x) => x.id === pick)

  useEffect(() => {
    if (open) {
      setDate(initialDate ?? isoDate(new Date()))
      setRating(0)
      setOutcome('decente')
      setReview('')
      setPhoto(undefined)
    }
  }, [open, initialDate])

  useEffect(() => {
    if (!pick && recipes?.length) setPick(recipes[0].id)
  }, [pick, recipes])

  return (
    <Sheet open={open} onClose={onClose} title="¿Cómo ha salido?">
      {!recipe && (
        <label className="field">
          <span className="label">Receta</span>
          <select className="select" value={pick} onChange={(e) => setPick(e.target.value)}>
            {recipes?.map((x) => (
              <option key={x.id} value={x.id}>
                {x.title}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="field">
        <span className="label">Fecha</span>
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <div className="field">
        <span className="label">Nota</span>
        <Stars value={rating} onChange={setRating} />
        {rating > 0 && <span className="small muted">{ratingRoast(rating, profile?.roastLevel ?? 'picante')}</span>}
      </div>
      <div className="field">
        <span className="label">Resultado</span>
        <div className="seg" role="group" aria-label="Resultado">
          {OUTCOMES.map((o) => (
            <button key={o.id} aria-pressed={outcome === o.id} onClick={() => setOutcome(o.id)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <label className="field">
        <span className="label">Reseña</span>
        <textarea
          className="textarea"
          style={{ minHeight: 90 }}
          placeholder="Qué cambiarías, qué salió bien, a quién culpas…"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
      </label>
      <label className="field">
        <span className="label">Foto (opcional)</span>
        <input
          className="input"
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            if (f) setPhoto(await compressImage(f, 900))
          }}
        />
        {photo && <img src={photo} alt="Vista previa" style={{ borderRadius: 12, maxHeight: 160, objectFit: 'cover' }} />}
      </label>
      <button
        className="btn btn--primary btn--lg btn--block"
        disabled={rating === 0 || !target}
        onClick={async () => {
          if (!target) return
          await saveLog({ recipeId: target.id, recipeTitle: target.title, date, rating, outcome, review: review.trim(), photo, scale: factor })
          toast(outcome === 'desastre' ? r('disaster') : ratingRoast(rating, profile?.roastLevel ?? 'picante'))
          onClose()
        }}
      >
        {rating === 0 ? 'Pon una nota primero' : 'Apuntar en el diario'}
      </button>
    </Sheet>
  )
}

