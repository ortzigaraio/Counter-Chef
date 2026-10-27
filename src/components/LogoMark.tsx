import { useId } from 'react'
import { logoInner } from '../brand/logo'

/** Marca animada: el aro y la campana rotan por la paleta (ver .logo--live en app.css). */
export function LogoMark({ size = 40, animated = true, title = 'Counter-Chef' }: { size?: number; animated?: boolean; title?: string }) {
  const id = 'cc' + useId().replace(/[^a-z0-9]/gi, '')
  return (
    <svg
      className={animated ? 'logo logo--live' : 'logo'}
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role="img"
      aria-label={title}
      // Marcado estático de src/brand/logo.ts; no lleva datos del usuario.
      dangerouslySetInnerHTML={{ __html: logoInner(id) }}
    />
  )
}
