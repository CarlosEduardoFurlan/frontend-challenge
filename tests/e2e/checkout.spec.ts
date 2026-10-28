import type { Page } from '@playwright/test'

import { DEMO, expect, test, type AppFixture } from '../fixtures/app'

const VALID_CPF = '529.982.247-25'

async function addToCart(page: Page, nftId: string) {
  await page.goto(`/nft/${nftId}`)
  await page.getByTestId('add-to-cart').click()
  await expect(page.getByTestId('toast').first()).toContainText('Adicionado ao carrinho')
}

/** Logs in as Ana (who has wallets), adds an item and fills the checkout up to the terms. */
async function prepareCheckout(app: AppFixture, page: Page, nftId = 'nft-001') {
  await app.goto('/login')
  await app.login()
  await addToCart(page, nftId)
  await page.goto('/checkout')
  const form = page.getByTestId('checkout-form')
  await form.getByLabel('CPF').fill(VALID_CPF)
  await expect(page.getByTestId('wallet-option-primary').getByRole('radio')).toBeChecked()
  await page.getByTestId('connect-wallet').click()
  await expect(page.getByTestId('wallet-connection')).toHaveAttribute('data-status', 'connected')
  await page.getByTestId('accept-terms').click()
  await expect(page.getByTestId('quote-summary')).toBeVisible()
  return form
}

async function ordersCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const db = JSON.parse(localStorage.getItem('nftm.mock.db.v1') ?? '{}') as { orders?: unknown[] }
    return db.orders?.length ?? 0
  })
}

test.describe('checkout and orders', () => {
  test('completes a purchase from the catalog to the confirmed receipt', async ({ app, page }) => {
    await prepareCheckout(app, page)
    await expect(page.getByTestId('quote-total')).toHaveText('0,0525 ETH')
    await page.getByTestId('confirm-order').click()

    await expect(page).toHaveURL(/\/orders\/ord_/)
    await expect(page.getByTestId('order-status')).toHaveText('Pendente')
    await expect(page.getByTestId('order-status')).toHaveText('Confirmado', { timeout: 15_000 })
    await expect(page.getByTestId('order-tx')).toContainText('0x')
    await expect(page.getByTestId('order-items').locator('li')).toHaveCount(1)
    await expect(page.getByTestId('order-total')).toHaveText('0,0525 ETH')

    // Purchased quantities leave the cart; the receipt is immutable afterwards.
    await expect(page.getByTestId('header-cart-count')).toHaveCount(0)
    await page.evaluate(() => window.__mock!.updatePrice('nft-001', 'nft-001-std', '0.5'))
    await page.reload()
    await expect(page.getByTestId('order-total')).toHaveText('0,0525 ETH')

    await page.goto('/account/orders')
    await expect(page.getByTestId('order-row')).toHaveCount(1)
    await expect(page.getByTestId('order-row')).toHaveAttribute('data-status', 'confirmed')
  })

  test('rejected payment keeps the items in the cart', async ({ app, page }) => {
    await prepareCheckout(app, page, 'nft-002')
    await app.setScenario('payment-rejected')
    await page.getByTestId('confirm-order').click()
    await expect(page.getByTestId('order-status')).toHaveText('Recusado', { timeout: 15_000 })
    await expect(page.getByTestId('order-rejection')).toContainText('recusado')
    await page.getByRole('link', { name: 'Voltar ao carrinho' }).click()
    await expect(page.getByTestId('cart-item')).toHaveAttribute('data-nft-id', 'nft-002')
  })

  test('repeated clicks create a single order', async ({ app, page }) => {
    await prepareCheckout(app, page)
    await page.evaluate(() => {
      const button = document.querySelector<HTMLButtonElement>('[data-testid="confirm-order"]')
      button?.click()
      button?.click()
      button?.click()
    })
    await expect(page).toHaveURL(/\/orders\/ord_/)
    await expect(page.getByTestId('order-status')).toHaveText('Confirmado', { timeout: 15_000 })
    expect(await ordersCount(page)).toBe(1)
  })

  test('timeout after creation recovers the same order through the idempotency key', async ({
    app,
    page,
  }) => {
    test.setTimeout(90_000)
    await prepareCheckout(app, page)
    await app.setScenario('order-timeout')
    await page.getByTestId('confirm-order').click()
    // The client times out after 15s and retries with the same Idempotency-Key.
    await expect(page).toHaveURL(/\/orders\/ord_/, { timeout: 30_000 })
    await expect(page.getByTestId('order-status')).toHaveText('Confirmado', { timeout: 20_000 })
    expect(await ordersCount(page)).toBe(1)
  })

  test('price change during checkout requires a new confirmation', async ({ app, page }) => {
    await prepareCheckout(app, page)
    await expect(page.getByTestId('quote-total')).toHaveText('0,0525 ETH')
    await app.setScenario('price-changed')
    await page.getByTestId('confirm-order').click()

    await expect(page.getByTestId('quote-stale')).toBeVisible()
    await expect(page.getByTestId('confirm-order')).toBeDisabled()
    await expect(page.getByTestId('quote-line').first()).toHaveAttribute(
      'data-status',
      'price_changed',
    )
    await expect(page.getByTestId('quote-total')).toHaveText('0,065 ETH')
    expect(await ordersCount(page)).toBe(0)

    await page.getByTestId('acknowledge-quote').click()
    await expect(page.getByTestId('confirm-order')).toBeEnabled()
    await page.getByTestId('confirm-order').click()
    await expect(page).toHaveURL(/\/orders\/ord_/)
    await expect(page.getByTestId('order-total')).toHaveText('0,065 ETH')
  })

  test('sold-out edition during checkout blocks the order', async ({ app, page }) => {
    await prepareCheckout(app, page, 'nft-003')
    await app.setScenario('sold-out')
    await page.getByTestId('confirm-order').click()
    await expect(page.getByTestId('checkout-blocking')).toBeVisible()
    await expect(page.getByTestId('confirm-order')).toBeDisabled()
    expect(await ordersCount(page)).toBe(0)
  })

  test('wallet connection can be rejected or dropped', async ({ app, page }) => {
    await app.goto('/login')
    await app.login()
    await addToCart(page, 'nft-004')
    await page.goto('/checkout')
    await page.getByTestId('checkout-form').getByLabel('CPF').fill(VALID_CPF)
    await page.getByTestId('accept-terms').click()

    await app.setScenario('wallet-rejected')
    await page.getByTestId('connect-wallet').click()
    await expect(page.getByTestId('wallet-connection')).toHaveAttribute('data-status', 'rejected')
    await expect(page.getByTestId('wallet-connection')).toContainText('Recusada')
    await expect(page.getByTestId('confirm-order')).toBeDisabled()

    await app.setScenario('wallet-disconnect')
    await page.getByTestId('connect-wallet').click()
    await expect(page.getByTestId('wallet-connection')).toHaveAttribute('data-status', 'connected')
    await expect(page.getByTestId('confirm-order')).toBeEnabled()
    await expect(page.getByTestId('wallet-connection')).toHaveAttribute(
      'data-status',
      'disconnected',
      { timeout: 10_000 },
    )
    await expect(page.getByTestId('confirm-order')).toBeDisabled()
  })

  test('session expiry during checkout resumes with the draft after re-login', async ({
    app,
    page,
  }) => {
    await app.goto('/login')
    await app.login()
    await addToCart(page, 'nft-005')
    await page.goto('/checkout')
    await page.getByTestId('checkout-form').getByLabel('CPF').fill(VALID_CPF)

    await page.evaluate(() => window.__mock!.expireSessions())
    await page.getByTestId('connect-wallet').click()
    await expect(page).toHaveURL(/\/login\?.*reason=expired/)
    await app.login()
    await expect(page).toHaveURL(/\/checkout$/)
    await expect(page.getByTestId('checkout-form').getByLabel('CPF')).toHaveValue(VALID_CPF)
    await expect(page.getByTestId('quote-line')).toHaveCount(1)
  })

  test('pending order survives a refresh and resolves later without a second purchase', async ({
    app,
    page,
  }) => {
    await prepareCheckout(app, page, 'nft-006')
    await app.setScenario('order-pending-long')
    await page.getByTestId('confirm-order').click()
    await expect(page.getByTestId('order-status')).toHaveText('Pendente')
    const url = page.url()

    await page.reload()
    await expect(page).toHaveURL(url)
    await expect(page.getByTestId('order-status')).toHaveText('Pendente')
    expect(await ordersCount(page)).toBe(1)

    await page.evaluate(() => window.__mock!.settlePendingOrders())
    await expect(page.getByTestId('order-status')).toHaveText('Confirmado', { timeout: 10_000 })
    expect(await ordersCount(page)).toBe(1)
  })

  test('user without wallets is guided to register one', async ({ app, page }) => {
    await app.goto('/login')
    await app.login(DEMO.bruno.email, DEMO.bruno.password)
    await addToCart(page, 'nft-008')
    await page.goto('/checkout')
    await expect(page.getByTestId('no-wallets')).toBeVisible()
    await expect(page.getByTestId('confirm-order')).toBeDisabled()
    await page.getByRole('link', { name: 'Cadastrar carteira' }).click()
    await expect(page).toHaveURL(/\/account\/wallets$/)
  })

  test('direct access to another user order is not found', async ({ app, page }) => {
    await prepareCheckout(app, page, 'nft-009')
    await page.getByTestId('confirm-order').click()
    await expect(page).toHaveURL(/\/orders\/ord_/)
    const url = page.url()
    await app.logout()
    await page.goto('/login')
    await app.login(DEMO.bruno.email, DEMO.bruno.password)
    await page.goto(url)
    await expect(page.getByTestId('empty-state')).toContainText('Pedido não encontrado')
  })
})
