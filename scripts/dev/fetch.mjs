import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:4173/?mock-reset=1', { waitUntil: 'networkidle' })
for (const q of process.argv.slice(2)) {
  const data = await page.evaluate(async (url) => {
    const r = await fetch(url)
    return r.json()
  }, q)
  console.log(q, '->', JSON.stringify(data).slice(0, 400))
}
await browser.close()
