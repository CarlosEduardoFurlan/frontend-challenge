/**
 * Captures full-page screenshots of one or more routes at the three evaluation widths.
 *
 * Usage: node scripts/screenshot.mjs <baseUrl> <outDir> [route ...]
 * Example: node scripts/screenshot.mjs http://localhost:4173 ./docs/screenshots / /cart
 */
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

import { chromium } from '@playwright/test'

const [baseUrl = 'http://localhost:4173', outDir = './docs/screenshots', ...routes] =
  process.argv.slice(2)
const targets = routes.length ? routes : ['/']
const widths = [
  { name: 'mobile-390', width: 390, height: 844, mobile: true },
  { name: 'tablet-768', width: 768, height: 1024, mobile: true },
  { name: 'desktop-1440', width: 1440, height: 900, mobile: false },
]

mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()

for (const route of targets) {
  for (const vp of widths) {
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
    await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
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
