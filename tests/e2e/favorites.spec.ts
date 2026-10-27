import { expect, test } from '../fixtures/app'

test.describe('favourites', () => {
  test('guest is sent to login and comes back after authenticating', async ({ app, page }) => {
    await app.goto('/nft/nft-003')
    await page.getByTestId('favorite-toggle').first().click()
    await expect(page).toHaveURL(/\/login\?.*reason=required/)
    await app.login()
    await expect(page).toHaveURL(/\/nft\/nft-003$/)
  })

  test('toggle is optimistic, persists for the user and can be removed from the list', async ({
    app,
    page,
  }) => {
    await app.goto('/login')
    await app.login()
    await page.goto('/nft/nft-004')
    const toggle = page.getByTestId('nft-detail').getByTestId('favorite-toggle')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    // Optimistic state is immediate; wait for the server round-trip before reloading.
    await expect(toggle).not.toHaveAttribute('aria-busy', 'true')

    await page.reload()
    await expect(page.getByTestId('nft-detail').getByTestId('favorite-toggle')).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await page.goto('/favorites')
    const grid = page.getByTestId('favorites-grid')
    await expect(grid.getByTestId('nft-card')).toHaveCount(3)
    await grid.locator('[data-nft-id="nft-004"]').getByTestId('favorite-toggle').click()
    await expect(grid.getByTestId('nft-card')).toHaveCount(2)
    await expect(grid.locator('[data-nft-id="nft-004"]')).toHaveCount(0)
  })

  test('failed mutation rolls back the optimistic state and informs the user', async ({
    app,
    page,
  }) => {
    await app.goto('/login')
    await app.login()
    await page.goto('/nft/nft-006')
    const toggle = page.getByTestId('nft-detail').getByTestId('favorite-toggle')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await app.setScenario('favorites-fail')
    await toggle.click()
    // Optimistic state first, then rollback once the API fails.
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByTestId('toast')).toContainText('Não foi possível favoritar')

    await page.reload()
    await expect(page.getByTestId('nft-detail').getByTestId('favorite-toggle')).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
