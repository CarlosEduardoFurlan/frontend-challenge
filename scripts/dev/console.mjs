import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning')
    console.log('[console]', m.type(), m.text().slice(0, 600))
})
page.on('pageerror', (e) =>
  console.log('[pageerror]', e.message.slice(0, 800), '\n', (e.stack || '').slice(0, 600)),
)
await page.goto(process.argv[2] ?? 'http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await browser.close()
