import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Cake, ChefHat, CookingPot, Croissant, Flame, Pizza, Star, Wine, X, Zap } from 'lucide-react'
import type { Category, Outcome, RoastLevel } from '../data/types'
import { OUTCOMES } from '../data/types'
import { useProfile } from '../data/repo'
import { roast, type RoastContext } from '../lib/roasts'
import { css } from '../lib/css'

// ---------- Toasts ----------

type Toast = { id: number; text: string }
const ToastCtx = createContext<(text: string) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((text: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t.slice(-2), { id, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <Zap size={18} aria-hidden />
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)

/** Frase del chef según el nivel de vacile del perfil. */
export function useRoast() {
  const profile = useProfile()
  const level: RoastLevel = profile?.roastLevel ?? 'picante'
  return useCallback((ctx: RoastContext, vars?: Record<string, string | number>, seed?: number) => roast(ctx, level, vars, seed), [level])
}

// ---------- Sheet (diálogo nativo) ----------

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      {open && (
        <div className="sheet-body stack" style={css({ '--gap': '16px' })}>
          <div className="sheet-grip" aria-hidden />
          <div className="row between">
            <h2 className="h-sec">{title}</h2>
            <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}

// ---------- Estrellas ----------

export function Stars({ value, onChange, size = 30 }: { value: number; onChange?: (n: number) => void; size?: number }) {
  if (!onChange)
    return (
      <span className="stars--static" aria-label={`${value} de 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} size={size} fill={n <= Math.round(value) ? 'currentColor' : 'none'} strokeWidth={n <= Math.round(value) ? 0 : 1.6} />
        ))}
      </span>
    )
  return (
    <div className="stars" role="radiogroup" aria-label="Puntuación">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={n === value} aria-label={`${n} estrellas`} data-on={n <= value} onClick={() => onChange(n)}>
          <Star size={size} fill={n <= value ? 'currentColor' : 'none'} strokeWidth={n <= value ? 0 : 1.6} />
        </button>
      ))}
    </div>
  )
}

export function OutcomeTag({ o }: { o: Outcome }) {
  return (
    <span className="outcome" data-o={o}>
      {o === 'desastre' && <Flame size={13} aria-hidden />}
      {OUTCOMES.find((x) => x.id === o)?.label}
    </span>
  )
}

// ---------- Vacíos ----------

export function Empty({ quip, children }: { quip: string; children?: ReactNode }) {
  return (
    <div className="empty reveal">
      <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden>
        <circle cx="44" cy="44" r="40" fill="var(--surface-2)" />
        <path d="M24 52h40l-4 14H28z" fill="var(--ink)" />
        <path d="M30 52c0-10 6-16 14-16s14 6 14 16" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
        <path d="M38 28c-2-4 2-6 0-10M48 28c-2-4 2-6 0-10" fill="none" stroke="var(--bomba)" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
      <p className="empty-quip">{quip}</p>
      {children}
    </div>
  )
}

// ---------- Avatares e iconos ----------

export function Avatar({ name, hue, size }: { name: string; hue: number; size?: 'lg' }) {
  const initial = (name.trim()[0] ?? '?').toUpperCase()
  return (
    <span className={size === 'lg' ? 'avatar avatar--lg' : 'avatar'} style={css({ '--h': hue })} aria-hidden>
      {initial}
    </span>
  )
}

export function CategoryIcon({ c, size = 24 }: { c: Category; size?: number }) {
  const props = { size, strokeWidth: 1.8, 'aria-hidden': true }
  switch (c) {
    case 'pizza':
      return <Pizza {...props} />
    case 'panaderia':
      return <Croissant {...props} />
    case 'reposteria':
      return <Cake {...props} />
    case 'bebida':
      return <Wine {...props} />
    case 'hosteleria':
      return <ChefHat {...props} />
    default:
      return <CookingPot {...props} />
  }
}

// ---------- Fotos ----------

/** Reduce la foto a ~1200 px en JPEG para que quepa en IndexedDB sin drama. */
export async function compressImage(file: File, max = 1200, quality = 0.82): Promise<string> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}

export function NumberField({
  label,
  value,
  onChange,
  suffix,
  step = 1,
  min = 0,
  hint,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  suffix?: string
  step?: number
  min?: number
  hint?: string
}) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      <div className="row" style={css({ '--gap': '8px' })}>
        <input
          className="input input--num"
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        />
        {suffix && <span className="muted small" style={{ minWidth: 24 }}>{suffix}</span>}
      </div>
      {hint && <span className="hint">{hint}</span>}
    </label>
  )
}
