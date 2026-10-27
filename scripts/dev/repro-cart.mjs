import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('response', async (r) => {
  if (r.url().includes('/api/cart') || r.url().includes('/api/auth/log')) {
    let t = ''
    try {
      t = (await r.text()).slice(0, 160)
    } catch {}
    console.log(
      '[res]',
      r.request().method(),
      r.url().replace('http://localhost:4173', ''),
      r.status(),
      t,
    )
  }
})
async function login(email) {
  await page.goto('http://localhost:4173/login')
  const form = page.getByTestId('login-form')
  await form.getByLabel('E-mail').fill(email)
  await form.getByLabel('Senha', { exact: true }).fill('Senha@123')
  await form.getByRole('button', { name: 'Entrar' }).click()
  await page.getByTestId('header-user-menu').waitFor()
}
async function logout() {
  await page.getByTestId('header-user-menu').click()
  await page.getByTestId('logout').click()
  await page.getByTestId('header-user-menu').waitFor({ state: 'detached' })
}
await page.goto('http://localhost:4173/nft/nft-003?mock-reset=1')
await page.getByTestId('add-to-cart').click()
await page.getByTestId('toast').first().waitFor()
console.log('--- login ana')
await login('ana@example.com')
await page.waitForTimeout(800)
console.log('--- logout')
await logout()
await page.waitForTimeout(500)
console.log('--- login bruno')
await login('bruno@example.com')
await page.waitForTimeout(800)
console.log('--- logout')
await logout()
await page.waitForTimeout(500)
console.log('--- login ana again')
await login('ana@example.com')
await page.waitForTimeout(800)
await page.goto('http://localhost:4173/cart')
await page.waitForTimeout(1000)
console.log('cart items:', await page.getByTestId('cart-item').count())
console.log(
  'db carts:',
  JSON.stringify(
    (await page.evaluate(() => JSON.parse(localStorage.getItem('nftm.mock.db.v1')).carts)).map(
      (c) => ({ o: c.ownerKey, n: c.items.length }),
    ),
  ),
)
await browser.close()
