import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.addInitScript(() => {
  window.__NativeWS = window.WebSocket
  window.__wsLog = []
  const desc = Object.getOwnPropertyDescriptor(window, 'WebSocket')
  window.__wsDescWritable = desc?.writable
  // Track reassignments of the global.
  let current = window.WebSocket
  Object.defineProperty(window, 'WebSocket', {
    configurable: true,
    enumerable: true,
    get() {
      return current
    },
    set(v) {
      window.__wsLog.push(
        'set WebSocket -> ' +
          (v === window.__NativeWS ? 'native' : 'patched') +
          ' at ' +
          (performance.now() | 0) +
          'ms',
      )
      current = v
    },
  })
})
page.on('console', (m) => {
  if (m.type() === 'error') console.log('[console]', m.text().slice(0, 120))
})
await page.goto('http://localhost:4173/?mock-reset=1')
await page.waitForFunction(() => Boolean(window.__mock))
await page.waitForTimeout(1500)
console.log(
  await page.evaluate(() => ({
    log: window.__wsLog,
    sameAsNative: window.WebSocket === window.__NativeWS,
    writable: window.__wsDescWritable,
  })),
)
await browser.close()
