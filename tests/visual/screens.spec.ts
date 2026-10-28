import type { Locator, Page } from '@playwright/test'

import { expect, test, type AppFixture } from '../fixtures/app'

/**
 * Visual regression of the four key screens. Data comes from the deterministic mock seed,
 * fonts and artworks are local, animations are disabled by the Playwright config and the
 * only time-dependent texts are masked.
 */
async function settle(page: Page) {
  await expect(page.getByTestId('realtime-status')).toHaveAttribute('data-state', 'connected')
  await expect(page.getByTestId('nft-card-skeleton')).toHaveCount(0)
  await expect(page.getByTestId('toast')).toHaveCount(0)
  await page.evaluate(() => document.fonts.ready)
  // Full-page screenshots do not scroll, so lazy images below the fold would never load:
  // walk the page once to trigger them, then return to the top.
  await page.evaluate(async () => {
    const step = window.innerHeight
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
    }
    window.scrollTo(0, 0)
  })
  // Wait for every image to finish decoding.
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
          (img) => new Promise((resolve) => img.addEventListener('load', resolve, { once: true })),
        ),
    )
  })
}

function masks(page: Page): Locator[] {
  return [page.locator('footer p', { hasText: '©' }), page.getByTestId('mock-panel-trigger')]
}

async function addToCart(page: Page, nftId: string) {
  await page.goto(`/nft/${nftId}`)
  await page.getByTestId('add-to-cart').click()
  await expect(page.getByTestId('toast').first()).toContainText('Adicionado ao carrinho')
  await page
    .getByTestId('toast')
    .first()
    .getByRole('button', { name: 'Fechar notificação' })
    .click()
  await expect(page.getByTestId('toast')).toHaveCount(0)
}

async function loginWithCart(app: AppFixture, page: Page) {
  await app.goto('/login')
  await app.login()
  await addToCart(page, 'nft-001')
  await addToCart(page, 'nft-005')
}

test.describe('visual regression', () => {
  test('home', async ({ app, page }) => {
    await app.goto('/')
    await expect(page.getByTestId('catalog-grid').getByTestId('nft-card')).toHaveCount(9)
    await settle(page)
    await expect(page).toHaveScreenshot('home.png', { fullPage: true, mask: masks(page) })
  })

  test('home with filters applied', async ({ app, page }) => {
    await app.goto('/?category=arte&sort=price_desc')
    await expect(page.getByTestId('catalog-grid').getByTestId('nft-card')).toHaveCount(4)
    await settle(page)
    await expect(page).toHaveScreenshot('home-filtered.png', { fullPage: true, mask: masks(page) })
  })

  test('nft detail', async ({ app, page }) => {
    await app.goto('/nft/nft-001')
    await expect(page.getByTestId('related-grid').getByTestId('nft-card').first()).toBeVisible()
    await settle(page)
    await expect(page).toHaveScreenshot('nft-detail.png', { fullPage: true, mask: masks(page) })
  })

  test('cart', async ({ app, page }) => {
    await loginWithCart(app, page)
    await page.goto('/cart')
    await expect(page.getByTestId('cart-item')).toHaveCount(2)
    await expect(page.getByTestId('quote-summary')).toBeVisible()
    await settle(page)
    await expect(page).toHaveScreenshot('cart.png', { fullPage: true, mask: masks(page) })
  })

  test('checkout', async ({ app, page }) => {
    await loginWithCart(app, page)
    await page.goto('/checkout')
    await expect(page.getByTestId('quote-summary')).toBeVisible()
    await page.getByTestId('connect-wallet').click()
    await expect(page.getByTestId('wallet-connection')).toHaveAttribute('data-status', 'connected')
    await settle(page)
    await expect(page).toHaveScreenshot('checkout.png', { fullPage: true, mask: masks(page) })
  })
})
