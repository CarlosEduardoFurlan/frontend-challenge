import AxeBuilder from '@axe-core/playwright'
import { chromium, devices } from '@playwright/test'
const browser = await chromium.launch()
for (const [label, ctxOpts] of [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['mobile', { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } }],
]) {
  const ctx = await browser.newContext(ctxOpts)
  const page = await ctx.newPage()
  await page.goto('http://localhost:4173/login?mock-reset=1')
  await page.waitForFunction(() => Boolean(window.__mock))
  const form = page.getByTestId('login-form')
  await form.getByLabel('E-mail').fill('ana@example.com')
  await form.getByLabel('Senha', { exact: true }).fill('Senha@123')
  await form.getByRole('button', { name: 'Entrar' }).click()
  await page.getByTestId('header-user-menu').waitFor()
  await page.goto('http://localhost:4173/nft/nft-001')
  await page.getByTestId('add-to-cart').click()
  await page.getByTestId('toast').first().waitFor()
  for (const path of [
    '/',
    '/nft/nft-001',
    '/cart',
    '/checkout',
    '/account/profile',
    '/account/wallets',
    '/account/orders',
    '/favorites',
  ]) {
    await page.goto('http://localhost:4173' + path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    const r = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('[data-testid="mock-panel-trigger"]')
      .analyze()
    const v = r.violations.filter((x) => ['serious', 'critical', 'moderate'].includes(x.impact))
    console.log(
      `[${label}] ${path}: ${v.length ? v.map((x) => `${x.id}(${x.impact}) x${x.nodes.length} -> ${x.nodes[0].target.join(' ').slice(0, 90)}`).join(' | ') : 'OK'}`,
    )
  }
  await ctx.close()
}
// logged-out pages
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
for (const path of ['/login', '/register']) {
  await page.goto('http://localhost:4173' + path + '?mock-reset=1', { waitUntil: 'networkidle' })
  const r = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('[data-testid="mock-panel-trigger"]')
    .analyze()
  const v = r.violations.filter((x) => ['serious', 'critical', 'moderate'].includes(x.impact))
  console.log(
    `[guest] ${path}: ${v.length ? v.map((x) => `${x.id}(${x.impact}) x${x.nodes.length} -> ${x.nodes[0].target.join(' ').slice(0, 90)}`).join(' | ') : 'OK'}`,
  )
}
await browser.close()
