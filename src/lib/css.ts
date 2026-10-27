import type { CSSProperties } from 'react'

/** Estilos en línea que admiten variables CSS (--gap, --h…). */
export const css = (s: CSSProperties & Record<`--${string}`, string | number>) => s as CSSProperties
