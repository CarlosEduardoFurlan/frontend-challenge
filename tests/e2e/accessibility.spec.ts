import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

import { expect, test, type AppFixture } from '../fixtures/app'

async function analyze(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // The floating mock panel trigger is a dev/demo control, outside the product UI.
    .exclude('[data-testid="mock-panel-trigger"]')
    .analyze()
  return results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
}

function describeViolations(violations: Awaited<ReturnType<typeof analyze>>) {
  return violations
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
    .join('\n')
}

async function loginWithItem(app: AppFixture, page: Page) {
  await app.goto('/login')
  await app.login()
  await page.goto('/nft/nft-001')
  await page.getByTestId('add-to-cart').click()
  await expect(page.getByTestId('toast').first()).toContainText('Adicionado ao carrinho')
}

test.describe('accessibility: automated scans', () => {
  for (const [name, path] of [
    ['home', '/'],
    ['nft detail', '/nft/nft-001'],
    ['login', '/login'],
    ['register', '/register'],
  ] as const) {
    test(`${name} has no serious or critical WCAG violations`, async ({ app, page }) => {
      await app.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.getByTestId('nft-card-skeleton')).toHaveCount(0)
      const violations = await analyze(page)
      expect(violations, describeViolations(violations)).toEqual([])
    })
  }

  test('cart, checkout and profile have no serious or critical WCAG violations', async ({
    app,
    page,
  }) => {
    await loginWithItem(app, page)
    for (const path of ['/cart', '/checkout', '/account/profile', '/account/wallets']) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
      const violations = await analyze(page)
      expect(violations, `${path}\n${describeViolations(violations)}`).toEqual([])
    }
  })
})

test.describe('accessibility: keyboard, focus and forms', () => {
  test('skip link, header navigation and search work with the keyboard', async ({ app, page }) => {
    await app.goto('/')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeFocused()

    await page.getByTestId('header-search-toggle').focus()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('catalog-search')).toBeFocused()
    await page.keyboard.type('Aurora')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/q=Aurora/)
    await expect(page.getByTestId('catalog-grid').getByTestId('nft-card')).toHaveCount(1)
  })

  test('user menu is operable with the keyboard and returns focus on close', async ({
    app,
    page,
  }) => {
    await app.goto('/login')
    await app.login()
    const trigger = page.getByTestId('header-user-menu')
    await trigger.focus()
    await page.keyboard.press('Enter')
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('menuitem').first()).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(menu.getByRole('menuitem').nth(1)).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('mobile filter drawer traps focus and restores it on close', async ({ app, page }) => {
    // The drawer only exists below the desktop breakpoint; shrink the viewport on every project.
    await page.setViewportSize({ width: 390, height: 844 })
    await app.goto('/')
    await expect(page.getByTestId('catalog-grid')).toBeVisible()
    const trigger = page.getByTestId('open-filters')
    await trigger.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByTestId('catalog-filters')).toBeVisible()

    // Focus stays inside the dialog while tabbing around.
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab')
      const inside = await page.evaluate(() =>
        Boolean(document.activeElement?.closest('[role="dialog"]')),
      )
      expect(inside).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('login form announces errors and focuses the first invalid field', async ({ app, page }) => {
    await app.goto('/login')
    const form = page.getByTestId('login-form')
    await form.getByRole('button', { name: 'Entrar' }).click()
    const email = form.getByLabel('E-mail')
    await expect(email).toHaveAttribute('aria-invalid', 'true')
    await expect(email).toBeFocused()
    const describedBy = await email.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    // React `useId` ids contain ":", so match by attribute instead of a CSS id selector.
    const messages = await Promise.all(
      describedBy!.split(' ').map(async (id) => {
        const node = page.locator(`[id="${id}"]`)
        return (await node.count()) ? node.textContent() : ''
      }),
    )
    expect(messages.join(' ')).toContain('Informe um e-mail válido.')
  })

  test('detail page gallery and purchase controls are keyboard operable', async ({ app, page }) => {
    await app.goto('/nft/nft-001')
    await page.getByRole('tab', { name: 'Imagem 1' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'Imagem 2' })).toBeFocused()
    await expect(page.getByRole('tab', { name: 'Imagem 2' })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    await page.getByTestId('qty-increment').focus()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('qty-input')).toHaveValue('2')

    await page.getByTestId('add-to-cart').focus()
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('toast').first()).toContainText('Adicionado ao carrinho')
    await expect(page.getByTestId('live-polite')).toContainText('Item adicionado ao carrinho.')
  })

  test('async feedback is exposed through live regions', async ({ app, page }) => {
    await app.goto('/login')
    await app.login()
    await page.goto('/nft/nft-003')
    await page.getByTestId('nft-detail').getByTestId('favorite-toggle').click()
    await expect(page.getByTestId('live-polite')).toContainText('Adicionado aos favoritos.')
  })
})
