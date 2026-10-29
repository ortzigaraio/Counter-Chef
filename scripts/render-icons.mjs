// Genera favicon, iconos PWA y apple-touch-icon a partir de src/brand/logo.ts.
// Uso: npm run icons   (Node 22+ ejecuta el .ts directamente)
import { writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('playwright')
import { BRAND, logoSvg } from '../src/brand/logo.ts'

mkdirSync('public', { recursive: true })
writeFileSync('public/favicon.svg', logoSvg({ size: 64 }))
writeFileSync('public/logo.svg', logoSvg())

const targets = [
  { file: 'icon-192.png', size: 192, svg: logoSvg({ size: 192 }) },
  { file: 'icon-512.png', size: 512, svg: logoSvg({ size: 512 }) },
  { file: 'icon-maskable-512.png', size: 512, svg: logoSvg({ size: 512, background: BRAND.ink, scale: 0.78 }) },
  { file: 'apple-touch-icon.png', size: 180, svg: logoSvg({ size: 180, background: BRAND.cream, scale: 0.9 }) },
]

const browser = await chromium.launch()
const page = await browser.newPage()
for (const t of targets) {
  await page.setViewportSize({ width: t.size, height: t.size })
  await page.setContent(`<html><body style="margin:0;background:transparent">${t.svg}</body></html>`)
  await page.locator('svg').screenshot({ path: `public/${t.file}`, omitBackground: true })
  console.log('ok', t.file)
}
await browser.close()
