import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('request', (r) => {
  if (r.url().includes('/api/favorites'))
    console.log('[req]', r.method(), r.url().replace('http://localhost:4173', ''))
})
page.on('response', (r) => {
  if (r.url().includes('/api/favorites'))
    console.log(
      '[res]',
      r.status(),
      r.request().method(),
      r.url().replace('http://localhost:4173', ''),
    )
})
page.on('requestfailed', (r) => {
  if (r.url().includes('/api/'))
    console.log(
      '[failed]',
      r.method(),
      r.url().replace('http://localhost:4173', ''),
      r.failure()?.errorText,
    )
})
page.on('console', (m) => {
  if (['error', 'warning'].includes(m.type())) console.log('[console]', m.text().slice(0, 200))
})
await page.goto('http://localhost:4173/login?mock-reset=1')
await page.waitForFunction(() => Boolean(window.__mock))
const form = page.getByTestId('login-form')
await form.getByLabel('E-mail').fill('ana@example.com')
await form.getByLabel('Senha', { exact: true }).fill('Senha@123')
await form.getByRole('button', { name: 'Entrar' }).click()
await page.getByTestId('header-user-menu').waitFor()
await page.goto('http://localhost:4173/nft/nft-004')
const toggle = page.getByTestId('nft-detail').getByTestId('favorite-toggle')
await toggle.waitFor()
console.log('pressed before click:', await toggle.getAttribute('aria-pressed'))
await toggle.click()
for (let i = 0; i < 8; i++) {
  await page.waitForTimeout(150)
  console.log(`t+${(i + 1) * 150}ms pressed:`, await toggle.getAttribute('aria-pressed'))
}
console.log(
  'db favorites:',
  await page.evaluate(() => JSON.parse(localStorage.getItem('nftm.mock.db.v1')).favorites),
)
await page.reload()
await page.getByTestId('nft-detail').getByTestId('favorite-toggle').waitFor()
await page.waitForTimeout(1500)
console.log(
  'after reload pressed:',
  await page.getByTestId('nft-detail').getByTestId('favorite-toggle').getAttribute('aria-pressed'),
)
console.log(
  'db favorites after reload:',
  await page.evaluate(() => JSON.parse(localStorage.getItem('nftm.mock.db.v1')).favorites),
)
await browser.close()
