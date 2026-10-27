import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
page.on('request', (r) => {
  if (r.url().includes('/api/')) console.log('[req]', r.url())
})
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 300)))
await page.goto(process.argv[2], { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
console.log('[url]', page.url())
console.log('[count]', await page.getByTestId('catalog-count').textContent())
await browser.close()
