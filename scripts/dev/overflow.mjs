/**
 * Lists the elements that extend past the viewport width (sources of horizontal overflow).
 *
 * Usage: SHOT_LOGIN=1 SHOT_CART=1 node scripts/dev/overflow.mjs http://localhost:4173 390 /route ...
 */
import { chromium } from '@playwright/test'

const [baseUrl = 'http://localhost:4173', widthArg = '390', ...routes] = process.argv.slice(2)
const width = Number(widthArg)
const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width, height: 844 },
  isMobile: true,
  hasTouch: true,
  locale: 'pt-BR',
})
const page = await context.newPage()
if (process.env.SHOT_LOGIN) {
  await page.goto(`${baseUrl}/login?mock-reset=1`)
  const form = page.getByTestId('login-form')
  await form.getByLabel('E-mail').fill('ana@example.com')
  await form.getByLabel('Senha', { exact: true }).fill('Senha@123')
  await form.getByRole('button', { name: 'Entrar' }).click()
  await page.getByTestId('header-user-menu').waitFor()
}
if (process.env.SHOT_CART) {
  for (const id of ['nft-001', 'nft-005']) {
    await page.goto(`${baseUrl}/nft/${id}`)
    await page.getByTestId('add-to-cart').click()
    await page.getByTestId('toast').first().waitFor()
  }
}
for (const route of routes.length ? routes : ['/']) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const offenders = await page.evaluate(() => {
    const limit = document.documentElement.clientWidth
    const out = []
    for (const el of document.querySelectorAll('body *')) {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0) continue
      if (rect.right > limit + 1 || rect.left < -1) {
        const tag = el.tagName.toLowerCase()
        const id = el.getAttribute('data-testid') || el.id || ''
        const cls = (el.getAttribute('class') || '').slice(0, 80)
        out.push(`${tag}${id ? `[${id}]` : ''} right=${Math.round(rect.right)} left=${Math.round(rect.left)} :: ${cls}`)
      }
    }
    return { limit, scroll: document.documentElement.scrollWidth, out: out.slice(0, 25) }
  })
  console.log(`\n${route} @${width}: clientWidth=${offenders.limit} scrollWidth=${offenders.scroll}`)
  offenders.out.forEach((line) => console.log('  ' + line))
}
await browser.close()
