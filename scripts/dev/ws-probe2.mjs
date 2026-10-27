import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
page.on('console', (m) => {
  if (['error'].includes(m.type())) console.log('[console]', m.text().slice(0, 160))
})
await page.goto('http://localhost:4173/?mock-reset=1')
await page.waitForFunction(() => Boolean(window.__mock))
await page.waitForTimeout(800)
console.log('sockets from app after 800ms:', await page.evaluate(() => window.__mock.socketCount()))
console.log(
  await page.evaluate(
    async () =>
      new Promise(async (resolve) => {
        const mod = await import('/assets/index-DWcoqRlG.js')
        const io =
          mod.io ??
          mod.default?.io ??
          Object.values(mod).find((v) => typeof v === 'function' && v.name === 'io')
        if (!io) return resolve('io export not found: ' + Object.keys(mod).join(','))
        const s = io('/', {
          path: '/socket.io',
          transports: ['websocket'],
          upgrade: false,
          reconnection: false,
        })
        s.on('connect', () => resolve('manual io connected id=' + s.id))
        s.on('connect_error', (e) => resolve('manual io connect_error: ' + e.message))
        setTimeout(() => resolve('manual io timeout'), 4000)
      }),
  ),
)
await browser.close()
