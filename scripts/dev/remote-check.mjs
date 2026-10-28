// Loads the published deployment in Chromium (desktop + mobile) and records console errors,
// failed requests, service worker (MSW), Socket.IO status, fonts and image assets.
import { chromium, devices } from 'playwright'

const BASE = process.env.REMOTE_BASE_URL || 'https://jungle-frontend-challenge-snowy.vercel.app'
const ROUTES = [
  '/',
  '/nft/nft-001',
  '/cart',
  '/login',
  '/register',
  '/account/profile',
  '/checkout',
]
const PROFILES = [
  { name: 'desktop', opts: { viewport: { width: 1440, height: 900 } } },
  { name: 'mobile', opts: { ...devices['Pixel 7'] } },
]

const browser = await chromium.launch()
const out = []
for (const profile of PROFILES) {
  const context = await browser.newContext(profile.opts)
  for (const route of ROUTES) {
    const page = await context.newPage()
    const consoleErrors = []
    const consoleWarnings = []
    const failed = []
    const bad = []
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200))
      if (m.type() === 'warning') consoleWarnings.push(m.text().slice(0, 200))
    })
    page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e).slice(0, 200)))
    page.on('requestfailed', (r) => failed.push(r.url() + ' ' + (r.failure()?.errorText ?? '')))
    page.on('response', (r) => {
      if (r.status() >= 400) bad.push(r.status() + ' ' + r.url())
    })
    await page.goto(BASE + route, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2500)
    const info = await page.evaluate(async () => {
      const sw = navigator.serviceWorker?.controller?.scriptURL ?? null
      const rt = document.querySelector('[data-testid="realtime-status"]')
      const imgs = [...document.images]
      const nftImgs = imgs.filter((i) => i.currentSrc.includes('/assets/'))
      const broken = imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc)
      await document.fonts.ready
      return {
        title: document.title,
        path: location.pathname,
        h1: document.querySelector('h1')?.textContent?.trim().slice(0, 60) ?? null,
        serviceWorker: sw,
        realtime: rt ? rt.getAttribute('data-state') : null,
        bodyFont: getComputedStyle(document.body).fontFamily,
        robotoMono400: document.fonts.check('400 16px "Roboto Mono"'),
        robotoMono700: document.fonts.check('700 16px "Roboto Mono"'),
        images: imgs.length,
        assetImages: nftImgs.length,
        brokenImages: broken,
        prerenderLeft: Boolean(document.getElementById('prerender')),
        rootChildren: document.getElementById('root')?.children.length ?? 0,
      }
    })
    out.push({ profile: profile.name, route, ...info, consoleErrors, consoleWarnings, failed, bad })
    await page.close()
  }
  await context.close()
}
await browser.close()
for (const r of out) {
  const flags = []
  if (r.consoleErrors.length) flags.push('console errors: ' + JSON.stringify(r.consoleErrors))
  if (r.failed.length) flags.push('failed: ' + JSON.stringify(r.failed))
  if (r.bad.length) flags.push('http>=400: ' + JSON.stringify(r.bad))
  if (r.brokenImages.length) flags.push('broken images: ' + JSON.stringify(r.brokenImages))
  console.log(
    `[${r.profile}] ${r.route} -> ${r.path} | h1="${r.h1}" | sw=${r.serviceWorker ? 'yes' : 'NO'} | realtime=${r.realtime} | font=${r.bodyFont.slice(0, 24)} (400:${r.robotoMono400} 700:${r.robotoMono700}) | imgs=${r.images}/${r.assetImages} | prerender=${r.prerenderLeft} | warnings=${r.consoleWarnings.length}` +
      (flags.length ? '\n    ' + flags.join('\n    ') : ''),
  )
}
const warn = out.flatMap((r) => r.consoleWarnings)
if (warn.length) console.log('warnings sample:', [...new Set(warn)].slice(0, 5))
