import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
page.on('websocket', (ws) => console.log('[network ws]', ws.url()))
page.on('console', (m) => {
  if (['error', 'warning', 'log'].includes(m.type()) && !m.text().includes('[MSW]'))
    console.log('[console]', m.type(), m.text().slice(0, 200))
})
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 300)))
await page.goto('http://localhost:4173/?mock-reset=1')
await page.waitForFunction(() => Boolean(window.__mock))
await page.waitForTimeout(2500)
console.log('count after app boot:', await page.evaluate(() => window.__mock.socketCount()))
console.log(
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        const ws = new WebSocket('ws://localhost:4173/socket.io/?EIO=4&transport=websocket')
        const got = []
        ws.onmessage = (e) => got.push(String(e.data).slice(0, 60))
        ws.onopen = () =>
          setTimeout(() => resolve({ raw: 'open', got, count: window.__mock.socketCount() }), 600)
        ws.onerror = () => resolve({ raw: 'error' })
        ws.onclose = (e) => got.push('close ' + e.code)
        setTimeout(() => resolve({ raw: 'timeout', got }), 3000)
      }),
  ),
)
await browser.close()
