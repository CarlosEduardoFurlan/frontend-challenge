/**
 * Captures full-page screenshots of one or more routes at the three evaluation widths.
 *
 * Usage: node scripts/screenshot.mjs <baseUrl> <outDir> [route ...]
 * Example: node scripts/screenshot.mjs http://localhost:4173 ./docs/figma-comparison/after / /cart
 * Env: SHOT_LOGIN=1 logs in as the demo user, SHOT_CART=1 adds two items, SHOT_ORDER=1 places
 * an order and screenshots its confirmation page (route "order"), SHOT_WIDTHS=a,b limits widths.
 */
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

import { chromium } from '@playwright/test'

const [baseUrl = 'http://localhost:4173', outDir = './docs/figma-comparison/after', ...routes] =
  process.argv.slice(2)
const targets = routes.length ? routes : ['/']
const onlyWidths = process.env.SHOT_WIDTHS ? process.env.SHOT_WIDTHS.split(',') : null
const widths = [
  { name: 'mobile-390', width: 390, height: 844, mobile: true },
  { name: 'mobile-414', width: 414, height: 896, mobile: true },
  { name: 'tablet-768', width: 768, height: 1024, mobile: true },
  { name: 'desktop-1440', width: 1440, height: 900, mobile: false },
]

mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()

for (const route of targets) {
  for (const vp of widths) {
    if (onlyWidths && !onlyWidths.includes(vp.name)) continue
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      deviceScaleFactor: 1,
      locale: 'pt-BR',
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    if (process.env.SHOT_LOGIN) {
      // Demo login so private screens can be captured.
      await page.goto(`${baseUrl}/login?mock-reset=1`)
      const form = page.getByTestId('login-form')
      await form.getByLabel('E-mail').fill('ana@example.com')
      await form.getByLabel('Senha', { exact: true }).fill('Senha@123')
      await form.getByRole('button', { name: 'Entrar' }).click()
      await page.getByTestId('header-user-menu').waitFor()
    }
    if (process.env.SHOT_CART) {
      // Put two editions in the cart so cart/checkout screens have content.
      for (const id of ['nft-001', 'nft-005']) {
        await page.goto(`${baseUrl}/nft/${id}`)
        await page.getByTestId('add-to-cart').click()
        await page.getByTestId('toast').first().waitFor()
      }
    }
    if (route === 'order') {
      // Place an order through the real checkout so the confirmation screen can be captured.
      await page.goto(`${baseUrl}/checkout`)
      await page.getByTestId('checkout-form').getByLabel('CPF').fill('529.982.247-25')
      await page.getByTestId('connect-wallet').click()
      await page
        .getByTestId('wallet-connection')
        .and(page.locator('[data-status="connected"]'))
        .waitFor()
      await page.getByTestId('accept-terms').click()
      await page.getByTestId('confirm-order').click()
      await page.getByTestId('order-receipt').waitFor()
      await page
        .locator('[data-testid="order-receipt"][data-status="confirmed"]')
        .waitFor({ timeout: 20_000 })
    } else {
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
    }
    await page.waitForTimeout(500)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    const slug = route === '/' ? 'home' : route.replace(/^\//, '').replace(/[/?=&$]/g, '-')
    const file = join(outDir, `${slug}--${vp.name}.png`)
    await page.screenshot({ path: file, fullPage: true })
    console.log(`${file}${overflow ? '  !! horizontal overflow' : ''}`)
    await context.close()
  }
}

await browser.close()
