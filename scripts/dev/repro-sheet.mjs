import { chromium, devices } from '@playwright/test'
const browser = await chromium.launch()
const ctx = await browser.newContext({
  ...devices['Pixel 7'],
  viewport: { width: 390, height: 844 },
  locale: 'pt-BR',
  timezoneId: 'America/Sao_Paulo',
})
const page = await ctx.newPage()
page.on('framenavigated', (f) => console.log('[nav]', f.url()))
page.on('console', (m) => {
  if (m.type() === 'error') console.log('[console]', m.text().slice(0, 200))
})
await page.goto('http://localhost:4173/?mock-reset=1')
await page.waitForFunction(() => Boolean(window.__mock))
const trig = page.getByTestId('open-filters')
console.log('visible', await trig.isVisible())
await trig.click()
console.log(
  'scrollY after click',
  await page.evaluate(() => window.scrollY),
  'dialog',
  await page.locator('[role=dialog]').count(),
)
await page.waitForTimeout(800)
console.log(
  'scrollY later',
  await page.evaluate(() => window.scrollY),
  'dialog',
  await page.locator('[role=dialog]').count(),
)
await page
  .getByTestId('filter-min-price')
  .fill('2', { timeout: 3000 })
  .catch((e) => console.log('fill failed:', e.message.split('\n')[0]))
await browser.close()
