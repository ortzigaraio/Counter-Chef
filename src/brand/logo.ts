/**
 * Marca de Counter-Chef (v2): sello hexagonal óxido con el terrorista Separatista
 * de de_inferno —boina, pasamontañas, correa cruzada— levantando una campana de servir,
 * grabado en una sola tinta crema. Inspirado en los monogramas de rótulo de casa de comidas.
 * Un solo origen para la app (LogoMark) y para los iconos (scripts/render-icons.mjs).
 */
export const BRAND = {
  paper: '#ECECE7',
  ink: '#2E2C29',
  rust: '#B4532A',
  rustDeep: '#8E3E1E',
  cream: '#F4EFE6',
}

const hex = (r: number, cx = 256, cy = 256) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')

export function logoInner(id = 'cc') {
  const { rust, rustDeep, cream, ink } = BRAND
  const line = (w: number) => `fill="none" stroke="${cream}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`
  return `
<defs><clipPath id="${id}-hex"><polygon points="${hex(214)}"/></clipPath></defs>
<polygon points="${hex(236)}" fill="${rust}" stroke="${rust}" stroke-width="28" stroke-linejoin="round"/>
<polygon points="${hex(214)}" fill="none" stroke="${rustDeep}" stroke-width="6" stroke-linejoin="round" opacity="0.55"/>
<polygon points="${hex(200)}" fill="none" stroke="${cream}" stroke-width="5" stroke-linejoin="round"/>
<g clip-path="url(#${id}-hex)">
  <path ${line(10)} d="M96 470 C102 396 146 352 200 334 L262 334 C316 352 360 396 366 470"/>
  <path ${line(8)} d="M200 334 L231 360 L262 334 M231 360 L231 470"/>
  <path ${line(14)} d="M196 340 L318 470"/>
  <path ${line(7)} d="M254 382 l18 -16 l14 14 l-18 16 z"/>
  <path ${line(10)} d="M328 362 C348 338 360 308 366 268 M360 372 C380 346 390 312 394 272"/>
  <path ${line(8)} d="M362 270 L398 274"/>
</g>
<path ${line(10)} d="M210 282 C210 302 206 320 200 334 L262 334 C256 320 252 302 252 282"/>
<path ${line(10)} d="M180 210 C180 168 202 150 231 150 C261 150 282 168 282 210 C282 240 274 262 260 276 C248 288 214 288 202 276 C188 262 180 240 180 210 Z"/>
<path ${line(4)} d="M212 304 C224 311 240 311 252 304 M206 316 C222 324 242 324 258 316"/>
<path fill="none" stroke="${cream}" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 11" d="M231 240 L231 288"/>
<path fill="${ink}" stroke="${cream}" stroke-width="5" stroke-linejoin="round" d="M197 220 C203 207 223 205 229 218 C223 230 203 232 197 220 Z"/>
<path fill="${ink}" stroke="${cream}" stroke-width="5" stroke-linejoin="round" d="M266 220 C260 207 240 205 234 218 C240 230 260 232 266 220 Z"/>
<circle cx="214" cy="218" r="4" fill="${cream}"/>
<circle cx="249" cy="218" r="4" fill="${cream}"/>
<path ${line(6)} d="M194 200 C206 192 220 194 229 203 M268 200 C256 192 242 194 234 203"/>
<path fill="${ink}" stroke="${cream}" stroke-width="6" stroke-linejoin="round" d="M166 178 C156 150 184 120 232 118 C282 116 308 136 304 158 C302 170 288 176 274 174 C250 168 206 168 182 186 C174 192 168 188 166 178 Z"/>
<path fill="none" stroke="${cream}" stroke-width="4" stroke-linecap="round" opacity="0.7" d="M190 142 C206 130 226 126 246 126"/>
<circle cx="232" cy="112" r="7" fill="${ink}" stroke="${cream}" stroke-width="4"/>
<path ${line(10)} d="M322 256 C322 214 344 194 372 194 C400 194 422 214 422 256 Z"/>
<path ${line(6)} d="M338 236 C342 220 352 210 364 206"/>
<path ${line(12)} d="M306 262 L438 262"/>
<circle cx="372" cy="184" r="8" fill="${cream}"/>`
}

/** Estrella de cinco puntas para acompañar al sello (como en los rótulos clásicos). */
export function starPath(cx: number, cy: number, r: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (Math.PI / 5) * i
    const rr = i % 2 ? r * 0.42 : r
    return `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`
  }).join(' ') + 'Z'
}

export function logoSvg(opts: { size?: number; id?: string; background?: string; scale?: number } = {}) {
  const size = opts.size ?? 512
  const scale = opts.scale ?? 1
  const t = (512 * (1 - scale)) / 2
  const bg = opts.background ? `<rect width="512" height="512" fill="${opts.background}"/>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">${bg}<g transform="translate(${t} ${t}) scale(${scale})">${logoInner(opts.id)}</g></svg>`
}
