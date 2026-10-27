import { expect, test } from '../fixtures/app'

test.describe('NFT detail: direct access, gallery, editions and limits', () => {
  test('direct access renders the NFT and the gallery switches images', async ({ app, page }) => {
    await app.goto('/nft/nft-005')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Jardim Latente/i)
    const main = page.getByTestId('nft-gallery').locator('img').first()
    await expect(main).toHaveAttribute('src', /nft-005-1\.webp/)
    await page.getByRole('tab', { name: 'Imagem 2' }).click()
    await expect(main).toHaveAttribute('src', /nft-005-2\.webp/)
    await expect(page.getByRole('tab', { name: 'Imagem 2' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('navigates from a catalog card to the detail page', async ({ app, page }) => {
    await app.goto('/')
    await page
      .getByTestId('catalog-grid')
      .getByRole('link', { name: /Aurora Fragmentada/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/nft\/nft-001$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Aurora Fragmentada/i)
  })

  test('unknown identifier shows the not-found state with a way back', async ({ app, page }) => {
    await app.goto('/nft/nao-existe')
    await expect(page.getByTestId('empty-state')).toContainText('NFT não encontrado')
    await page.getByRole('link', { name: 'Voltar ao catálogo' }).click()
    await expect(page.getByTestId('catalog-grid')).toBeVisible()
  })

  test('sold-out NFT disables purchase controls', async ({ app, page }) => {
    await app.goto('/nft/nft-013')
    await expect(
      page.getByTestId('nft-detail').getByText('Esgotado', { exact: true }),
    ).toBeVisible()
    await expect(page.getByTestId('qty-input')).toBeDisabled()
    for (const radio of await page.getByRole('radio').all()) await expect(radio).toBeDisabled()
  })

  test('unavailable edition is disabled and quantity respects the limit', async ({ app, page }) => {
    await app.goto('/nft/nft-007')
    const limited = page.getByTestId('edition-nft-007-ltd')
    await expect(limited).toContainText('Esgotada')
    await expect(limited.getByRole('radio')).toBeDisabled()

    await expect(page.getByTestId('quantity-hint')).toHaveText(/Máximo de 2 unidades/)
    await page.getByTestId('qty-increment').click()
    await expect(page.getByTestId('qty-input')).toHaveValue('2')
    await expect(page.getByTestId('qty-increment')).toBeDisabled()
    await page.getByTestId('qty-input').fill('9')
    await expect(page.getByTestId('qty-input')).toHaveValue('2')
  })

  test('server error shows a retry that recovers', async ({ app, page }) => {
    await app.goto('/nft/nft-003', { scenario: 'server-error' })
    await expect(page.getByTestId('error-state')).toBeVisible()
    await app.setScenario('default')
    await page.getByRole('button', { name: 'Tentar novamente' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Órbita Silenciosa/i)
  })
})
