import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.addInitScript(() => {
  window.__log = []
  const origDefine = Object.defineProperty
  Object.defineProperty = function (target, prop, desc) {
    if (target === globalThis && prop === 'WebSocket')
      window.__log.push('defineProperty WebSocket at ' + (performance.now() | 0) + 'ms')
    return origDefine.call(this, target, prop, desc)
  }
})
await page.goto('http://localhost:4173/?mock-reset=1')
await page.waitForFunction(() => Boolean(window.__mock))
await page.waitForTimeout(2000)
console.log(
  await page.evaluate(() => ({
    log: window.__log,
    scripts: performance
      .getEntriesByType('resource')
      .filter((e) => e.name.includes('/assets/') && e.name.endsWith('.js'))
      .map(
        (e) => `${e.name.split('/').pop()} start=${e.startTime | 0}ms end=${e.responseEnd | 0}ms`,
      ),
  })),
)
await browser.close()
