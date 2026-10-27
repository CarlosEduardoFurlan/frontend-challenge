import { expect, test } from '../fixtures/app'

test.describe('application bootstrap', () => {
  test('renders the home page with data served by MSW', async ({ app, page }) => {
    await app.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByTestId('featured-grid').getByTestId('nft-card').first()).toBeVisible()
  })

  test('shows the not-found page for unknown routes', async ({ app, page }) => {
    await app.goto('/this-route-does-not-exist')
    await expect(page.getByRole('heading', { name: /não encontrada/i })).toBeVisible()
    await page.getByRole('link', { name: 'Voltar ao início' }).click()
    await expect(page).toHaveURL(/\/$/)
  })
})
