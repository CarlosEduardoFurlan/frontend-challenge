import type { Page } from '@playwright/test'

import { DEMO, expect, test, type AppFixture } from '../fixtures/app'

const VALID_CPF = '529.982.247-25'

async function waitForRealtime(page: Page) {
  await expect(page.getByTestId('realtime-status')).toHaveAttribute('data-state', 'connected')
}

async function addToCart(page: Page, nftId: string) {
  await page.goto(`/nft/${nftId}`)
  await page.getByTestId('add-to-cart').click()
  await expect(page.getByTestId('toast').first()).toContainText('Adicionado ao carrinho')
}

async function prepareCheckout(app: AppFixture, page: Page, nftId: string) {
  await app.goto('/login')
  await app.login()
  await addToCart(page, nftId)
  await page.goto('/checkout')
  await waitForRealtime(page)
  await page.getByTestId('checkout-form').getByLabel('CPF').fill(VALID_CPF)
  await page.getByTestId('connect-wallet').click()
  await expect(page.getByTestId('wallet-connection')).toHaveAttribute('data-status', 'connected')
  await page.getByTestId('accept-terms').click()
  await expect(page.getByTestId('quote-summary')).toBeVisible()
}

test.describe('realtime: nft.updated', () => {
  test('detail, catalog and cart update live when a price changes', async ({ app, page }) => {
    await app.goto('/')
    await addToCart(page, 'nft-002')
    await page.goto('/nft/nft-002')
    await waitForRealtime(page)
    await expect(page.getByTestId('nft-detail')).toHaveAttribute('data-nft-version', '1')

    // Event goes mock store -> Socket.IO mock server -> socket.io-client -> cache.
    await page.evaluate(() => window.__mock!.updatePrice('nft-002', 'nft-002-std', '0.2'))
    await expect(page.getByTestId('nft-detail')).toHaveAttribute('data-nft-version', '2')
    await expect(page.getByTestId('edition-nft-002-std')).toContainText('0,2 ETH')
    await expect(page.getByTestId('toast').first()).toContainText('agora custa 0,2 ETH')

    await page.goto('/cart')
    await waitForRealtime(page)
    await expect(page.locator('[data-nft-id="nft-002"]')).toContainText('0,2 ETH')
    await page.evaluate(() => window.__mock!.updateAvailability('nft-002', 'nft-002-std', 0))
    await expect(
      page.locator('[data-nft-id="nft-002"]').getByTestId('sold-out-badge'),
    ).toBeVisible()
    await expect(page.getByTestId('cart-blocking')).toBeVisible()
    await expect(page.getByTestId('go-to-checkout')).toBeDisabled()
  })

  test('checkout detects a price change pushed while reviewing', async ({ app, page }) => {
    await prepareCheckout(app, page, 'nft-001')
    await expect(page.getByTestId('quote-total')).toHaveText('0,0525 ETH')
    await expect(page.getByTestId('confirm-order')).toBeEnabled()

    await page.evaluate(() => window.__mock!.updatePrice('nft-001', 'nft-001-std', '0.08'))
    await expect(page.getByTestId('quote-stale')).toBeVisible()
    await expect(page.getByTestId('confirm-order')).toBeDisabled()
    await expect(page.getByTestId('quote-total')).toHaveText('0,0825 ETH')

    await page.getByTestId('acknowledge-quote').click()
    await page.getByTestId('confirm-order').click()
    await expect(page).toHaveURL(/\/orders\/ord_/)
    await expect(page.getByTestId('order-total')).toHaveText('0,0825 ETH')
  })

  test('duplicated and stale events never regress the state', async ({ app, page }) => {
    await app.goto('/nft/nft-003')
    await waitForRealtime(page)
    await page.evaluate(() => window.__mock!.updatePrice('nft-003', 'nft-003-std', '0.3'))
    await expect(page.getByTestId('nft-detail')).toHaveAttribute('data-nft-version', '2')
    await expect(page.getByTestId('edition-nft-003-std')).toContainText('0,3 ETH')
    await expect(page.getByTestId('toast')).toHaveCount(1)

    // Stale event (version 1 with the old price) must be ignored.
    await page.evaluate(() =>
      window.__mock!.replayNftEvent('nft-003', { version: 1, payload: { priceEth: '0.18' } }),
    )
    await page.waitForTimeout(500)
    await expect(page.getByTestId('nft-detail')).toHaveAttribute('data-nft-version', '2')
    await expect(page.getByTestId('edition-nft-003-std')).toContainText('0,3 ETH')

    // Duplicate (same eventId as an already applied event) must not be re-applied.
    const last = await page.evaluate(() => window.__mock!.replayNftEvent('nft-003', { version: 3 }))
    await expect(page.getByTestId('nft-detail')).toHaveAttribute('data-nft-version', '3')
    await page.evaluate(
      (id) => window.__mock!.replayNftEvent('nft-003', { eventId: id, version: 3 }),
      last!.eventId,
    )
    await page.waitForTimeout(500)
    await expect(page.getByTestId('toast')).toHaveCount(2)
  })
})

test.describe('realtime: order.updated, disconnection and resume', () => {
  test('pending order is confirmed through the socket after a connection drop', async ({
    app,
    page,
  }) => {
    await prepareCheckout(app, page, 'nft-004')
    await app.setScenario('order-pending-long')
    await page.getByTestId('confirm-order').click()
    await expect(page.getByTestId('order-status')).toHaveText('Pendente')
    await waitForRealtime(page)

    await page.evaluate(() => window.__mock!.dropSockets())
    await expect(page.getByTestId('realtime-status')).not.toHaveAttribute('data-state', 'connected')
    await expect(page.getByTestId('realtime-status')).toHaveAttribute('data-state', 'connected', {
      timeout: 10_000,
    })

    await page.evaluate(() => window.__mock!.settlePendingOrders())
    await expect(page.getByTestId('order-status')).toHaveText('Confirmado', { timeout: 2500 })
    await expect(
      page.getByTestId('toast').filter({ hasText: 'Pagamento confirmado' }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () =>
          (JSON.parse(localStorage.getItem('nftm.mock.db.v1') ?? '{}') as { orders: unknown[] })
            .orders.length,
      ),
    ).toBe(1)
  })

  test('events of a previous session never reach the next user', async ({ app, page }) => {
    await prepareCheckout(app, page, 'nft-005')
    await app.setScenario('order-pending-long')
    await page.getByTestId('confirm-order').click()
    await expect(page.getByTestId('order-status')).toHaveText('Pendente')

    await app.logout()
    await page.goto('/login')
    await app.login(DEMO.bruno.email, DEMO.bruno.password)
    await page.goto('/')
    await waitForRealtime(page)
    await page.evaluate(() => window.__mock!.settlePendingOrders())
    await page.waitForTimeout(1500)
    await expect(page.getByTestId('toast').filter({ hasText: 'Pagamento confirmado' })).toHaveCount(
      0,
    )
  })

  test('reconnection reconciles the catalog with REST', async ({ app, page }) => {
    await app.goto('/nft/nft-006')
    await waitForRealtime(page)
    // The price changes while the connection is down: no event is delivered, so the client
    // must learn about it by refetching on reconnection.
    await page.evaluate(() => {
      window.__mock!.dropSockets()
      window.__mock!.updatePrice('nft-006', 'nft-006-std', '0.9')
    })
    await expect(page.getByTestId('realtime-status')).toHaveAttribute('data-state', 'connected', {
      timeout: 10_000,
    })
    await expect(page.getByTestId('nft-detail')).toHaveAttribute('data-nft-version', '2', {
      timeout: 10_000,
    })
    await expect(page.getByTestId('edition-nft-006-std')).toContainText('0,9 ETH')
  })
})
