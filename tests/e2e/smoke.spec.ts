import { expect, test } from '@playwright/test'

test.describe('application bootstrap', () => {
  test('renders the home page and reaches the mocked API through MSW', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // The home page shows the mocked /health status; "ok" only arrives through MSW.
    await expect(page.getByText('API: ok')).toBeVisible()
  })

  test('shows the not-found page for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist')
    await expect(page.getByRole('heading', { name: /não encontrada/i })).toBeVisible()
  })
})
