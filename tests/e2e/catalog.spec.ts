import type { Page } from '@playwright/test'

import { expect, test } from '../fixtures/app'

const grid = (page: Page) => page.getByTestId('catalog-grid')
const cards = (page: Page) => grid(page).getByTestId('nft-card')

/** Waits until the grid shows data for the current URL (placeholder data is kept while fetching). */
async function settled(page: Page) {
  await expect(page.getByTestId('catalog-refreshing')).toHaveCount(0)
  await expect(grid(page)).not.toHaveAttribute('aria-busy', 'true')
}

/** Opens the filter sheet on mobile; on desktop the filters are always visible in the sidebar. */
async function openFilters(page: Page) {
  await page.getByTestId('catalog-filters').or(page.getByTestId('open-filters')).first().waitFor()
  const trigger = page.getByTestId('open-filters')
  if (await trigger.isVisible()) {
    // A previous sheet may still be animating out; wait before toggling it again.
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await trigger.click()
    await expect(page.getByRole('dialog')).toBeVisible()
  }
}

test.describe('catalog: search, filters, sorting, pagination and history', () => {
  test('search puts the term in the URL and narrows the results', async ({ app, page }) => {
    await app.goto('/')
    await expect(cards(page)).toHaveCount(9)
    await page.getByTestId('catalog-search').fill('Aurora')
    await page.getByTestId('catalog-search-submit').click()
    await expect(page).toHaveURL(/q=Aurora/)
    await expect(cards(page)).toHaveCount(1)
    await expect(cards(page).first()).toContainText('Aurora Fragmentada')
    await expect(page.getByTestId('catalog-count')).toHaveText('1 resultado')
  })

  test('filters combine, are reflected in the URL and reset the page', async ({ app, page }) => {
    await app.goto('/?page=2')
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByRole('button', { name: 'Página 2' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    await openFilters(page)
    await page.getByTestId('filter-category-games').click()
    await expect(page).toHaveURL(/category=games/)
    await expect(page).not.toHaveURL(/page=/)

    await openFilters(page)
    await page.getByTestId('filter-available').click()
    await expect(page).toHaveURL(/available=true/)
    await expect(page).toHaveURL(/category=games/)

    await page.getByTestId('catalog-sort').selectOption('price_desc')
    await expect(page).toHaveURL(/sort=price_desc/)
    await settled(page)

    const prices = await cards(page)
      .locator('text=/ETH$/')
      .evaluateAll((nodes) =>
        nodes.map((n) => Number((n.textContent ?? '').replace(' ETH', '').replace(',', '.'))),
      )
    expect(prices.length).toBeGreaterThan(0)
    expect([...prices].sort((a, b) => b - a)).toEqual(prices)

    // Every card belongs to the games collection and is available.
    for (const card of await cards(page).all()) {
      await expect(card).toContainText('Cosmos Pixelado')
      await expect(card.getByTestId('nft-card-available')).not.toHaveText('Indisponível')
    }
  })

  test('price range filter applies on submit and validates input', async ({ app, page }) => {
    await app.goto('/')
    await openFilters(page)
    await page.getByTestId('filter-min-price').fill('2')
    await page.getByTestId('filter-max-price').fill('1')
    await page.getByTestId('apply-price').click()
    await expect(page.getByRole('alert')).toContainText('mínimo não pode ser maior')

    await page.getByTestId('filter-min-price').fill('1')
    await page.getByTestId('filter-max-price').fill('2')
    await page.getByTestId('apply-price').click()
    await expect(page).toHaveURL(/minPrice=1/)
    await expect(page).toHaveURL(/maxPrice=2/)
    await settled(page)
    for (const card of await cards(page).all()) {
      const text = await card.locator('text=/ETH$/').first().textContent()
      const value = Number((text ?? '').replace(' ETH', '').replace(',', '.'))
      expect(value).toBeGreaterThanOrEqual(1)
      expect(value).toBeLessThanOrEqual(2)
    }
  })

  test('pagination navigates and survives refresh and history', async ({ app, page }) => {
    await app.goto('/')
    await expect(cards(page)).toHaveCount(9)
    const firstOnPageOne = await cards(page).first().getAttribute('data-nft-id')

    await page.getByRole('button', { name: 'Próxima página' }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect(cards(page).first()).not.toHaveAttribute('data-nft-id', firstOnPageOne ?? '')

    await page.reload()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByRole('button', { name: 'Página 2' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    await page.goBack()
    await expect(page).not.toHaveURL(/page=/)
    await expect(cards(page).first()).toHaveAttribute('data-nft-id', firstOnPageOne ?? '')

    await page.goForward()
    await expect(page).toHaveURL(/page=2/)
  })

  test('direct access with parameters restores search, sort and inputs', async ({ app, page }) => {
    await app.goto('/?q=Mar%C3%A9&sort=price_asc&category=fotografia')
    await expect(page.getByTestId('catalog-search')).toHaveValue('Maré')
    await expect(page.getByTestId('catalog-sort')).toHaveValue('price_asc')
    await expect(cards(page)).toHaveCount(1)
    await expect(cards(page).first()).toContainText('Maré Alta')
  })

  test('history restores a previous search term', async ({ app, page }) => {
    await app.goto('/')
    await page.getByTestId('catalog-search').fill('Pulso')
    await page.getByTestId('catalog-search-submit').click()
    await expect(cards(page)).toHaveCount(1)
    await page.getByTestId('catalog-search').fill('Cosmos')
    await page.getByTestId('catalog-search-submit').click()
    await expect(page).toHaveURL(/q=Cosmos/)
    await expect(cards(page)).toHaveCount(4)
    await page.goBack()
    await expect(page).toHaveURL(/q=Pulso/)
    await expect(page.getByTestId('catalog-search')).toHaveValue('Pulso')
    await expect(cards(page)).toHaveCount(1)
  })

  test('shows an empty state and clears filters', async ({ app, page }) => {
    await app.goto('/?q=zzzz-nada')
    await expect(page.getByTestId('empty-state')).toContainText('Nenhum NFT encontrado')
    await page.getByTestId('empty-state').getByRole('button', { name: 'Limpar filtros' }).click()
    await expect(cards(page)).toHaveCount(9)
  })

  test('empty catalog scenario renders the empty state', async ({ app, page }) => {
    await app.goto('/', { scenario: 'empty-catalog' })
    await expect(page.getByTestId('empty-state').first()).toBeVisible()
  })
})
