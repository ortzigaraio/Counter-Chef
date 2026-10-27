/**
 * Marca de Counter-Chef: el "Phoenix" de CS con pasamontañas y gorro de chef,
 * sosteniendo una campana, monolínea dentro de un aro.
 * Un solo origen para la app (LogoMark) y para los iconos (scripts/render-icons.mjs).
 * Los colores salen de variables CSS con valor de reserva, así el aro y la campana
 * se pueden animar desde la hoja de estilos.
 */
export const BRAND = {
  ink: '#1A1512',
  cream: '#FFF7EA',
  bomba: '#FF5A1F',
  mostaza: '#FFC93C',
  albahaca: '#1FA36B',
  ct: '#3D6BFF',
}

const ink = `var(--logo-ink, ${BRAND.ink})`
const cream = `var(--logo-cream, ${BRAND.cream})`
const accent = `var(--logo-accent, ${BRAND.bomba})`
const ring = `var(--logo-ring, ${BRAND.bomba})`
const glint = `var(--logo-glint, ${BRAND.mostaza})`

export function logoInner(id = 'cc') {
  const s = (w: number) => `stroke="${ink}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`
  const buttons = [404, 446, 488]
    .map((y) => `<circle cx="230" cy="${y}" r="9" fill="${ink}"/><circle cx="282" cy="${y}" r="9" fill="${ink}"/>`)
    .join('')
  return `
<defs><clipPath id="${id}-in"><circle cx="256" cy="256" r="222"/></clipPath></defs>
<circle cx="256" cy="256" r="240" fill="${cream}"/>
<g clip-path="url(#${id}-in)">
  <path fill="${cream}" ${s(14)} d="M96 520 C104 420 140 372 214 350 L256 372 L298 350 C372 372 408 420 416 520 Z"/>
  <path fill="none" ${s(10)} d="M256 372 L256 520"/>
  ${buttons}
  <path fill="${cream}" ${s(12)} d="M212 338 L256 368 L300 338 L292 366 L256 384 L220 366 Z"/>
  <path fill="${cream}" ${s(12)} d="M246 380 L232 424 L256 410 L280 424 L266 380"/>
  <path fill="none" ${s(48)} d="M344 378 C380 360 392 330 396 286"/>
  <path fill="none" stroke="${cream}" stroke-width="26" stroke-linecap="round" d="M344 378 C380 360 392 330 396 286"/>
  <rect x="372" y="268" width="48" height="22" rx="6" fill="${ink}"/>
</g>
<path fill="${cream}" ${s(14)} d="M196 188 C190 236 196 286 220 318 C238 340 274 340 292 318 C316 286 322 236 316 188 Z"/>
<path fill="none" ${s(8)} d="M214 284 C224 300 236 308 248 310 M298 284 C290 298 280 306 268 310"/>
<path fill="${ink}" d="M210 238 C218 222 242 220 253 233 C245 248 220 252 210 238 Z"/>
<path fill="${ink}" d="M302 238 C294 222 270 220 259 233 C267 248 292 252 302 238 Z"/>
<circle cx="236" cy="236" r="5" fill="${glint}"/>
<circle cx="276" cy="236" r="5" fill="${glint}"/>
<path fill="none" ${s(9)} d="M206 212 L248 222 M306 212 L264 222"/>
<path fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round" stroke-dasharray="1 15" d="M256 256 L256 330"/>
<path fill="${cream}" ${s(14)} d="M198 170 C162 166 150 124 176 104 C190 92 210 92 222 100 C228 70 254 56 280 64 C300 70 310 86 308 100 C326 90 350 98 356 120 C364 148 342 170 314 170 Z"/>
<rect x="194" y="160" width="124" height="38" rx="8" fill="${cream}" ${s(14)}/>
<path fill="none" ${s(8)} d="M236 160 L232 128 M276 160 L280 128"/>
<circle class="logo-ring" cx="256" cy="256" r="231" fill="none" stroke="${ring}" stroke-width="20"/>
<path class="logo-accent" fill="${accent}" ${s(12)} d="M332 260 C332 210 364 186 398 186 C432 186 464 210 464 260 Z"/>
<rect x="318" y="256" width="160" height="16" rx="8" fill="${ink}"/>
<circle cx="398" cy="176" r="12" fill="${ink}"/>
<path fill="none" stroke="${glint}" stroke-width="9" stroke-linecap="round" d="M356 238 C360 220 372 208 386 202"/>`
}

export function logoSvg(opts: { size?: number; id?: string; background?: string; scale?: number } = {}) {
  const size = opts.size ?? 512
  const scale = opts.scale ?? 1
  const t = (512 * (1 - scale)) / 2
  const bg = opts.background ? `<rect width="512" height="512" fill="${opts.background}"/>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">${bg}<g transform="translate(${t} ${t}) scale(${scale})">${logoInner(opts.id)}</g></svg>`
}
