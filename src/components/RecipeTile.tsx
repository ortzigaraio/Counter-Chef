import { Link } from 'react-router-dom'
import { Check, Clock } from 'lucide-react'
import { CategoryIcon } from './ui'
import type { Category } from '../data/types'
import { css } from '../lib/css'

/** La única tarjeta de receta de la app: catálogo, portada y relacionadas. */
export function RecipeTile({
  to,
  title,
  category,
  photo,
  minutes,
  meta,
  saved,
}: {
  to: string
  title: string
  category: Category
  photo?: string
  minutes?: number
  meta?: string
  saved?: boolean
}) {
  return (
    <Link to={to} className="ccard" data-cat={category}>
      <span className="ccard-img">
        {photo ? <img src={photo} alt="" loading="lazy" decoding="async" /> : <CategoryIcon c={category} size={34} />}
        {saved && (
          <span className="ccard-saved" aria-label="Ya está en tu recetario">
            <Check size={14} aria-hidden />
          </span>
        )}
      </span>
      <span className="ccard-body">
        <span className="ccard-title">{title}</span>
        <span className="rmeta num" style={css({ marginTop: 4 })}>
          {minutes ? (
            <span className="row" style={{ gap: 3 }}>
              <Clock size={12} aria-hidden /> {minutes < 120 ? `${minutes} min` : `${Math.round(minutes / 60)} h`}
            </span>
          ) : null}
          {meta && <span>{meta}</span>}
        </span>
      </span>
    </Link>
  )
}
