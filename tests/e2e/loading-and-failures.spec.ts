import { expect, test } from '../fixtures/app'

test.describe('skeletons, failures and recovery', () => {
  test('slow network shows shimmer skeletons before the catalog arrives', async ({ app, page }) => {
    await app.goto('/', { scenario: 'slow-network' })
    await expect(page.getByTestId('nft-card-skeleton').first()).toBeVisible()
    await expect(page.getByTestId('catalog-grid').getByTestId('nft-card').first()).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByTestId('nft-card-skeleton')).toHaveCount(0)
  })

  test('catalog failure shows an accessible error and retry recovers', async ({ app, page }) => {
    await app.goto('/', { scenario: 'catalog-network-error-once' })
    const error = page.getByTestId('error-state').last()
    await expect(error).toBeVisible({ timeout: 15_000 })
    await expect(error).toHaveAttribute('role', 'alert')
    await error.getByRole('button', { name: 'Tentar novamente' }).click()
    await expect(page.getByTestId('catalog-grid').getByTestId('nft-card').first()).toBeVisible()
  })

  test('network error scenario fails fast and recovers after switching back', async ({
    app,
    page,
  }) => {
    await app.goto('/nft/nft-002', { scenario: 'network-error' })
    await expect(page.getByTestId('error-state')).toContainText('Não foi possível conectar', {
      timeout: 20_000,
    })
    await app.setScenario('default')
    await page.getByRole('button', { name: 'Tentar novamente' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Pulso Laranja/i)
  })
})
