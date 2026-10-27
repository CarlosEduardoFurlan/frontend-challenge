import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('request', (r) => {
  if (r.url().includes('/api/'))
    console.log('[req]', r.method(), r.url().replace('http://localhost:4173', ''))
})
page.on('response', async (r) => {
  if (r.url().includes('/api/wallets') || r.url().includes('/api/profile'))
    console.log('[res]', r.status(), (await r.text()).slice(0, 200))
})
page.on('console', (m) => {
  if (['error', 'warning'].includes(m.type())) console.log('[console]', m.text().slice(0, 300))
})
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 300)))
await page.goto('http://localhost:4173/login?mock-reset=1')
await page.waitForFunction(() => Boolean(window.__mock))
const form = page.getByTestId('login-form')
await form.getByLabel('E-mail').fill('bruno@example.com')
await form.getByLabel('Senha', { exact: true }).fill('Senha@123')
await form.getByRole('button', { name: 'Entrar' }).click()
await page.getByTestId('header-user-menu').waitFor()
await page.goto('http://localhost:4173/account/wallets')
const pf = page.getByTestId('wallet-primary-form')
await pf.getByLabel('Nome da carteira').fill('Principal')
await pf.getByLabel('Endereço').fill('0x123')
await pf.getByRole('button', { name: 'Cadastrar carteira' }).click()
await page.waitForTimeout(500)
console.log('client error visible:', await pf.getByText(/Endereço inválido/).isVisible())
await page.evaluate(() => {
  document
    .querySelector('[data-testid=wallet-primary-form]')
    .addEventListener('submit', () => console.log('SUBMIT EVENT fired'))
})
page.on('console', (m) => {
  if (m.text().includes('SUBMIT')) console.log('[console]', m.text())
})
await pf.getByLabel('Endereço').fill('0xAbCdEf0123456789aBcDeF0123456789AbCdEf01')
await pf.getByLabel('Rede').selectOption('polygon')
console.log(
  'button disabled?',
  await pf.getByRole('button', { name: 'Cadastrar carteira' }).isDisabled(),
  'address value:',
  await pf.getByLabel('Endereço').inputValue(),
  'invalid attr:',
  await pf.getByLabel('Endereço').getAttribute('aria-invalid'),
)
await pf.getByRole('button', { name: 'Cadastrar carteira' }).click()
await page.waitForTimeout(1500)
console.log(
  'after 2nd click, invalid attr:',
  await pf.getByLabel('Endereço').getAttribute('aria-invalid'),
)
await pf.getByLabel('Endereço').press('Enter')
await page.waitForTimeout(1500)
console.log(
  'errors in form:',
  await pf.locator('[role=alert], .text-destructive').allTextContents(),
)
console.log('toasts:', await page.getByTestId('toast').allTextContents())
// avatar
await page.goto('http://localhost:4173/account/profile')
const prof = page.getByTestId('profile-form')
await prof
  .getByTestId('avatar-input')
  .setInputFiles({
    name: 'a.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVQIW2P8z8DwnwEIGBkYGP4DAAt1A/+sIpa8AAAAAElFTkSuQmCC',
      'base64',
    ),
  })
await page.waitForTimeout(1000)
console.log(
  'avatar preview count:',
  await prof.getByTestId('avatar-preview').count(),
  'alerts:',
  await prof.locator('[role=alert], .text-destructive').allTextContents(),
)
await browser.close()
