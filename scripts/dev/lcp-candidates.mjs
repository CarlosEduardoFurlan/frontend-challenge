import { chromium, devices } from '@playwright/test'
const browser = await chromium.launch()
const ctx = await browser.newContext({
  ...devices['Pixel 7'],
  viewport: { width: 390, height: 844 },
})
const page = await ctx.newPage()
await page.addInitScript(() => {
  window.__lcp = []
  new PerformanceObserver((list) => {
    for (const e of list.getEntries())
      window.__lcp.push({
        t: Math.round(e.startTime),
        size: e.size,
        url: (e.url || '').split('/').pop(),
        tag: e.element ? e.element.tagName + '.' + String(e.element.className).slice(0, 40) : null,
        removed: e.element === null,
      })
  }).observe({ type: 'largest-contentful-paint', buffered: true })
})
const client = await ctx.newCDPSession(page)
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
})
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 })
await page.goto(process.argv[2] ?? 'http://localhost:4173/?mock-reset=1')
await page.waitForTimeout(6000)
console.log(JSON.stringify(await page.evaluate(() => window.__lcp), null, 1))
await browser.close()
