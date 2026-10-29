/**
 * Marca de Counter-Chef: el terrorista Separatista de de_inferno (boina negra,
 * pasamontañas blanco, camisa azul con parche rojo y correa cruzada) sosteniendo
 * una campana de servir, sobre el cielo naranja de Inferno con su campanario.
 * Ilustración estática con volumen. Un solo origen para la app (LogoMark) y para
 * los iconos (scripts/render-icons.mjs).
 */
export const BRAND = {
  ink: '#1A1512',
  cream: '#FFF7EA',
  bomba: '#FF5A1F',
  mostaza: '#FFC93C',
  albahaca: '#1FA36B',
  ct: '#3D6BFF',
}

const INK = '#1A1512'

export function logoInner(id = 'cc') {
  const g = (name: string) => `${id}-${name}`
  const line = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`
  return `
<defs>
  <radialGradient id="${g('sky')}" cx="50%" cy="30%" r="75%">
    <stop offset="0" stop-color="#FF9A4D"/>
    <stop offset="0.55" stop-color="#FF5A1F"/>
    <stop offset="1" stop-color="#B8360C"/>
  </radialGradient>
  <radialGradient id="${g('cloth')}" cx="38%" cy="32%" r="78%">
    <stop offset="0" stop-color="#FFFDF8"/>
    <stop offset="0.5" stop-color="#E9E3D5"/>
    <stop offset="1" stop-color="#ACA28C"/>
  </radialGradient>
  <radialGradient id="${g('skin')}" cx="50%" cy="40%" r="60%">
    <stop offset="0" stop-color="#9A6244"/>
    <stop offset="1" stop-color="#5E3624"/>
  </radialGradient>
  <linearGradient id="${g('shirt')}" x1="0" y1="0" x2="1" y2="0.6">
    <stop offset="0" stop-color="#7F95BC"/>
    <stop offset="0.5" stop-color="#5D74A0"/>
    <stop offset="1" stop-color="#3C4E74"/>
  </linearGradient>
  <linearGradient id="${g('sleeve')}" x1="0" y1="1" x2="1" y2="0">
    <stop offset="0" stop-color="#4A5D86"/>
    <stop offset="1" stop-color="#6F86B0"/>
  </linearGradient>
  <linearGradient id="${g('beret')}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#4A4644"/>
    <stop offset="0.5" stop-color="#262321"/>
    <stop offset="1" stop-color="#121010"/>
  </linearGradient>
  <linearGradient id="${g('steel')}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFFFFF"/>
    <stop offset="0.45" stop-color="#D5D9DD"/>
    <stop offset="1" stop-color="#7D858D"/>
  </linearGradient>
  <linearGradient id="${g('strap')}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#3A2E28"/>
    <stop offset="1" stop-color="#1E1714"/>
  </linearGradient>
  <clipPath id="${g('in')}"><circle cx="256" cy="256" r="226"/></clipPath>
</defs>

<circle cx="256" cy="256" r="250" fill="${INK}"/>
<circle cx="256" cy="256" r="226" fill="url(#${g('sky')})"/>

<g clip-path="url(#${g('in')})">
  <!-- Campanario de Inferno -->
  <g fill="#A8300A" opacity="0.75">
    <rect x="70" y="190" width="64" height="330"/>
    <path d="M62 196 L102 132 L142 196 Z"/>
    <rect x="96" y="112" width="12" height="26"/>
    <path d="M88 236 a14 18 0 0 1 28 0 v30 h-28 Z" fill="#7E2306"/>
  </g>
  <g fill="#A8300A" opacity="0.55">
    <rect x="392" y="320" width="120" height="200"/>
    <path d="M384 324 L452 290 L520 324 Z"/>
  </g>

  <!-- Torso -->
  <path fill="url(#${g('shirt')})" ${line} stroke-width="5"
    d="M52 540 C56 432 98 372 196 336 L288 336 C386 372 428 432 432 540 Z"/>
  <!-- Pliegues y sombras de la camisa -->
  <path fill="#3C4E74" opacity="0.55" d="M288 336 C340 356 380 382 404 430 C368 410 330 398 300 400 Z"/>
  <path fill="none" stroke="#3C4E74" stroke-width="5" stroke-linecap="round" d="M150 440 C170 470 176 500 172 530 M338 452 C330 480 330 506 334 530"/>
  <!-- Tapeta y botones -->
  <path fill="none" stroke="#33446A" stroke-width="4.5" d="M242 360 L242 540"/>
  <circle cx="252" cy="418" r="5" fill="#2A3656"/>
  <circle cx="252" cy="470" r="5" fill="#2A3656"/>
  <!-- Cuello de la camisa -->
  <path fill="#7389B3" ${line} stroke-width="4.5" d="M196 334 L242 360 L212 392 L188 346 Z"/>
  <path fill="#5F76A2" ${line} stroke-width="4.5" d="M288 334 L242 360 L272 392 L296 346 Z"/>

  <!-- Parche rojo del hombro -->
  <g transform="translate(138 436) rotate(-20)">
    <path d="M-24 -26 H24 V6 C24 22 0 32 0 32 C0 32 -24 22 -24 6 Z" fill="#C9301B" ${line} stroke-width="5"/>
    <path d="M0 -17 C10 -6 14 2 12 10 C10 18 4 22 0 22 C-6 22 -12 16 -12 8 C-12 0 -6 -4 -4 -10 C-2 -4 2 -2 4 0 C6 -6 4 -12 0 -17 Z" fill="${BRAND.mostaza}"/>
  </g>
  <!-- Insignia dorada del pecho -->
  <g transform="translate(322 424)">
    <path d="M-17 -20 H17 V2 C17 16 0 24 0 24 C0 24 -17 16 -17 2 Z" fill="#E0B23C" ${line} stroke-width="4"/>
    <path d="M-7 6 V-2 C-13 -3 -13 -12 -6 -12 C-5 -17 5 -17 6 -12 C13 -12 13 -3 7 -2 V6 Z" fill="#7A5A12"/>
    <rect x="-7" y="8" width="14" height="4" rx="1" fill="#7A5A12"/>
  </g>

  <!-- Correa cruzada con hebilla -->
  <path fill="url(#${g('strap')})" ${line} stroke-width="5" d="M168 340 L196 336 L372 540 L336 540 Z"/>
  <path fill="none" stroke="#5A4A40" stroke-width="3" d="M180 344 L350 536"/>
  <rect x="238" y="408" width="30" height="24" rx="3" transform="rotate(49 253 420)" fill="#B9A06A" ${line} stroke-width="4"/>
  <rect x="246" y="414" width="14" height="12" rx="2" transform="rotate(49 253 420)" fill="#2A211D"/>

  <!-- Brazo levantado con guante -->
  <path fill="url(#${g('sleeve')})" ${line} stroke-width="5"
    d="M352 372 C376 352 392 324 398 290 L436 296 C434 340 418 380 392 408 Z"/>
  <path fill="none" stroke="#33446A" stroke-width="5" stroke-linecap="round" d="M372 380 C390 360 402 336 408 310"/>
  <rect x="392" y="280" width="50" height="22" rx="6" fill="#3C4E74" ${line} stroke-width="4.5" transform="rotate(6 417 291)"/>
  <path fill="#1F1C1B" ${line} stroke-width="4.5" d="M392 286 C390 266 400 252 418 252 C436 252 446 266 444 288 Z"/>
</g>

<!-- Cabeza: pasamontañas -->
<path fill="url(#${g('cloth')})" ${line} stroke-width="5"
  d="M206 280 C206 304 204 322 196 338 C224 352 262 352 288 338 C280 322 278 304 278 280 Z"/>
<path fill="url(#${g('cloth')})" ${line} stroke-width="5"
  d="M180 206 C180 152 206 126 242 126 C280 126 304 152 304 206 C304 246 294 276 276 294 C262 308 222 308 208 294 C190 276 180 246 180 206 Z"/>
<!-- Sombras y arrugas de la tela -->
<path fill="#B3AA95" opacity="0.6" d="M276 150 C300 172 306 214 300 246 C296 270 286 288 272 298 C284 262 288 214 276 150 Z"/>
<path fill="none" stroke="#A39983" stroke-width="5" stroke-linecap="round"
  d="M214 318 C228 326 256 328 270 318 M204 334 C220 342 262 344 280 334"/>
<path fill="#C9C0AC" opacity="0.55" d="M206 240 C214 262 226 276 240 282 C226 284 212 274 204 258 Z"/>
<path fill="none" stroke="#A39983" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 10" opacity="0.7" d="M242 128 L242 182"/>
<!-- Aberturas de los ojos -->
<path fill="url(#${g('skin')})" stroke="#6E6553" stroke-width="3.5" d="M204 214 C208 202 230 200 234 212 C230 224 208 226 204 214 Z"/>
<path fill="url(#${g('skin')})" stroke="#6E6553" stroke-width="3.5" d="M282 214 C278 202 256 200 252 212 C256 224 278 226 282 214 Z"/>
<circle cx="220" cy="213" r="6" fill="${INK}"/>
<circle cx="266" cy="213" r="6" fill="${INK}"/>
<circle cx="222" cy="210.5" r="2" fill="#FFFFFF"/>
<circle cx="268" cy="210.5" r="2" fill="#FFFFFF"/>
<!-- Ceño fruncido de la tela -->
<path fill="#B3AA95" d="M198 198 C212 186 230 190 240 204 C228 198 212 198 198 204 Z"/>
<path fill="#A0967F" d="M288 198 C274 186 256 190 246 204 C258 198 274 198 288 204 Z"/>

<!-- Boina negra ladeada -->
<path fill="url(#${g('beret')})" ${line} stroke-width="5"
  d="M170 178 C156 146 186 108 244 104 C304 100 338 124 334 150 C332 164 318 172 300 170 C268 164 214 164 186 182 C178 188 172 186 170 178 Z"/>
<path fill="#0F0D0C" ${line} stroke-width="4.5" d="M182 178 C214 160 270 158 304 168 L302 182 C268 174 216 176 186 194 Z"/>
<path fill="none" stroke="#6A6461" stroke-width="5" stroke-linecap="round" opacity="0.8" d="M196 134 C214 120 240 114 266 114"/>
<circle cx="250" cy="102" r="6" fill="#121010" ${line} stroke-width="4"/>

<!-- Campana de servir -->
<path fill="url(#${g('steel')})" ${line} stroke-width="5" d="M350 258 C350 208 380 184 416 184 C452 184 482 208 482 258 Z"/>
<path fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity="0.9" d="M370 236 C374 216 388 202 404 198"/>
<rect x="336" y="254" width="160" height="16" rx="8" fill="#9AA1A8" ${line} stroke-width="4.5"/>
<circle cx="416" cy="176" r="11" fill="#C7CCD1" ${line} stroke-width="4.5"/>

<circle cx="256" cy="256" r="238" fill="none" stroke="${BRAND.bomba}" stroke-width="12"/>`
}

export function logoSvg(opts: { size?: number; id?: string; background?: string; scale?: number } = {}) {
  const size = opts.size ?? 512
  const scale = opts.scale ?? 1
  const t = (512 * (1 - scale)) / 2
  const bg = opts.background ? `<rect width="512" height="512" fill="${opts.background}"/>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">${bg}<g transform="translate(${t} ${t}) scale(${scale})">${logoInner(opts.id)}</g></svg>`
}
