import type { Page } from '@playwright/test'

import { DEMO, expect, test } from '../fixtures/app'

async function addFromDetail(page: Page, nftId: string, quantity = 1) {
  await page.goto(`/nft/${nftId}`)
  await page.getByTestId('nft-detail').waitFor()
  for (let i = 1; i < quantity; i++) await page.getByTestId('qty-increment').click()
  await page.getByTestId('add-to-cart').click()
  await expect(page.getByTestId('toast').first()).toContainText('Adicionado ao carrinho')
}

test.describe('cart', () => {
  test('adds an item with quantity, shows totals from the API and persists after refresh', async ({
    app,
    page,
  }) => {
    await app.goto('/')
    await addFromDetail(page, 'nft-001', 2)
    await expect(page.getByTestId('header-cart-count')).toHaveText('2')

    await page.goto('/cart')
    const item = page.getByTestId('cart-item')
    await expect(item).toHaveCount(1)
    await expect(item.getByTestId('qty-input')).toHaveValue('2')
    await expect(page.getByTestId('quote-subtotal')).toHaveText('0,1 ETH')
    await expect(page.getByTestId('quote-fee')).toHaveText('0,0025 ETH')
    await expect(page.getByTestId('quote-total')).toHaveText('0,1025 ETH')

    await page.reload()
    await expect(page.getByTestId('cart-item')).toHaveCount(1)
    await expect(page.getByTestId('header-cart-count')).toHaveText('2')
  })

  test('respects stock limits when changing quantities and removes items', async ({
    app,
    page,
  }) => {
    await app.goto('/')
    await addFromDetail(page, 'nft-007')
    await page.goto('/cart')
    const item = page.getByTestId('cart-item')
    await item.getByTestId('qty-increment').click()
    await expect(item.getByTestId('qty-input')).toHaveValue('2')
    await expect(item.getByTestId('qty-increment')).toBeDisabled()
    await expect(page.getByTestId('header-cart-count')).toHaveText('2')

    await page.reload()
    await expect(page.getByTestId('cart-item').getByTestId('qty-input')).toHaveValue('2')

    await page.getByTestId('remove-item').click()
    await expect(page.getByTestId('empty-state')).toContainText('Seu carrinho está vazio')
    await expect(page.getByTestId('header-cart-count')).toHaveCount(0)
    await expect(page.getByTestId('go-to-checkout')).toBeDisabled()
  })

  test('applies, rejects and removes coupons with totals from the API', async ({ app, page }) => {
    await app.goto('/')
    await addFromDetail(page, 'nft-001', 2)
    await page.goto('/cart')
    await expect(page.getByTestId('quote-total')).toHaveText('0,1025 ETH')

    await page.getByTestId('coupon-input').fill('NAOEXISTE')
    await page.getByTestId('coupon-apply').click()
    await expect(page.getByTestId('coupon-error')).toHaveText('Este cupom não existe.')

    await page.getByTestId('coupon-input').fill('EXPIRADO')
    await page.getByTestId('coupon-apply').click()
    await expect(page.getByTestId('coupon-error')).toHaveText('Este cupom expirou.')

    await page.getByTestId('coupon-input').fill('JUNGLE20')
    await page.getByTestId('coupon-apply').click()
    await expect(page.getByTestId('coupon-error')).toContainText('Subtotal mínimo de 1 ETH')

    await page.getByTestId('coupon-input').fill('bemvindo10')
    await page.getByTestId('coupon-apply').click()
    await expect(page.getByTestId('coupon-applied')).toContainText('BEMVINDO10')
    await expect(page.getByTestId('quote-discount')).toHaveText('−0,01 ETH')
    await expect(page.getByTestId('quote-total')).toHaveText('0,0925 ETH')

    await page.reload()
    await expect(page.getByTestId('coupon-applied')).toContainText('BEMVINDO10')

    await page.getByTestId('coupon-remove').click()
    await expect(page.getByTestId('coupon-form')).toBeVisible()
    await expect(page.getByTestId('quote-total')).toHaveText('0,1025 ETH')
  })

  test('coupon scenarios reject every code as invalid or expired', async ({ app, page }) => {
    await app.goto('/')
    await addFromDetail(page, 'nft-002')
    await page.goto('/cart')
    await app.setScenario('coupon-expired')
    await page.getByTestId('coupon-input').fill('BEMVINDO10')
    await page.getByTestId('coupon-apply').click()
    await expect(page.getByTestId('coupon-error')).toHaveText('Este cupom expirou.')
    await app.setScenario('coupon-invalid')
    await page.getByTestId('coupon-apply').click()
    await expect(page.getByTestId('coupon-error')).toHaveText('Este cupom não existe.')
  })

  test('keeps guest items when logging in and isolates carts between users', async ({
    app,
    page,
  }) => {
    test.setTimeout(60_000)
    await app.goto('/')
    await addFromDetail(page, 'nft-003')
    await page.goto('/login')
    await app.login()
    await expect(page.getByTestId('toast').first()).toContainText('Carrinho recuperado')
    await expect(page.getByTestId('header-cart-count')).toHaveText('1')
    await page.goto('/cart')
    await expect(page.getByTestId('cart-item')).toHaveAttribute('data-nft-id', 'nft-003')

    await app.logout()
    await page.goto('/cart')
    await expect(page.getByTestId('empty-state')).toBeVisible()

    await page.goto('/login')
    await app.login(DEMO.bruno.email, DEMO.bruno.password)
    await page.goto('/cart')
    await expect(page.getByTestId('empty-state')).toBeVisible()

    await app.logout()
    await page.goto('/login')
    await app.login()
    await page.goto('/cart')
    await expect(page.getByTestId('cart-item')).toHaveAttribute('data-nft-id', 'nft-003')
  })

  test('buy now as a guest keeps the item and asks for login before the checkout', async ({
    app,
    page,
  }) => {
    await app.goto('/nft/nft-004')
    await page.getByTestId('buy-now').click()
    await expect(page).toHaveURL(/\/login\?.*redirect=%2Fcheckout/)
    await expect(page.getByTestId('header-cart-count')).toHaveText('1')
    await app.login()
    await expect(page).toHaveURL(/\/checkout$/)
  })

  test('reflects price and availability changes from the API in the cart', async ({
    app,
    page,
  }) => {
    await app.goto('/')
    await addFromDetail(page, 'nft-001')
    await addFromDetail(page, 'nft-002')
    await page.evaluate(() => {
      window.__mock!.updatePrice('nft-001', 'nft-001-std', '0.09')
      window.__mock!.updateAvailability('nft-002', 'nft-002-std', 0)
    })
    await page.goto('/cart')
    const first = page.locator('[data-nft-id="nft-001"]')
    await expect(first.getByTestId('price-changed-badge')).toBeVisible()
    await expect(first).toContainText('0,09 ETH')
    await expect(first).toContainText('0,05 ETH')
    const second = page.locator('[data-nft-id="nft-002"]')
    await expect(second.getByTestId('sold-out-badge')).toBeVisible()
    await expect(page.getByTestId('cart-blocking')).toBeVisible()
    await expect(page.getByTestId('go-to-checkout')).toBeDisabled()
    await expect(page.getByTestId('quote-subtotal')).toHaveText('0,09 ETH')

    await second.getByTestId('remove-item').click()
    await expect(page.getByTestId('cart-blocking')).toHaveCount(0)
    await expect(page.getByTestId('go-to-checkout')).toBeEnabled()
  })
})
