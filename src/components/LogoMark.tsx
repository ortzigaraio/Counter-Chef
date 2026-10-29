import { useId } from 'react'
import { logoInner } from '../brand/logo'

/** Marca de Counter-Chef: el Separatista de de_inferno con su campana de servir. */
export function LogoMark({ size = 40, title = 'Counter-Chef' }: { size?: number; title?: string }) {
  const id = 'cc' + useId().replace(/[^a-z0-9]/gi, '')
  return (
    <svg
      className="logo"
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
