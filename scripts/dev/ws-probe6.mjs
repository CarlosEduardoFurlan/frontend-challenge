import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
page.on('console', (m) => {
  const t = m.text()
  if (t.includes('MSW') || m.type() === 'warning')
    console.log('[console]', m.type(), t.slice(0, 400))
})
await page.goto('http://localhost:4173/?mock-reset=1')
await page.waitForFunction(() => Boolean(window.__mock))
await page.waitForTimeout(3000)
await browser.close()
