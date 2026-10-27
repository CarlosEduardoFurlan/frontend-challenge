import { expect, test as base, type Page } from '@playwright/test'

/**
 * Shared Playwright fixture.
 *
 * Every test runs in a fresh browser context (empty localStorage), so the mock database starts
 * from the seed. `app.goto` additionally sends `mock-reset` + `mock-scenario` so a test can
 * switch scenario deterministically before the first request. Mid-test scenario changes go
 * through `window.__mock`, which is the same code path as the REST control endpoints.
 */
export interface AppFixture {
  goto(path: string, options?: { scenario?: string; reset?: boolean }): Promise<void>
  setScenario(id: string): Promise<void>
  reset(): Promise<void>
  /** Logs in through the real UI and waits for the session to be established. */
  login(email?: string, password?: string): Promise<void>
  page: Page
}

export const DEMO = {
  ana: { email: 'ana@example.com', password: 'Senha@123', name: 'Ana Ribeiro' },
  bruno: { email: 'bruno@example.com', password: 'Senha@123', name: 'Bruno Carvalho' },
} as const

function withMockParams(path: string, scenario: string | undefined, reset: boolean): string {
  const url = new URL(path, 'http://placeholder.local')
  if (reset) url.searchParams.set('mock-reset', '1')
  if (scenario) url.searchParams.set('mock-scenario', scenario)
  return `${url.pathname}${url.search}${url.hash}`
}

export const test = base.extend<{ app: AppFixture }>({
  app: async ({ page }, use) => {
    const app: AppFixture = {
      page,
      async goto(path, options) {
        await page.goto(withMockParams(path, options?.scenario, options?.reset ?? true))
        // Mocks are installed before React renders; wait for both so helpers can act immediately.
        await page.waitForFunction(() => Boolean(window.__mock))
        await page.getByRole('banner').waitFor()
      },
      async setScenario(id) {
        await page.waitForFunction(() => Boolean(window.__mock))
        await page.evaluate((scenarioId) => window.__mock!.setScenario(scenarioId), id)
      },
      async reset() {
        await page.evaluate(() => window.__mock!.reset())
      },
      async login(email = DEMO.ana.email, password = DEMO.ana.password) {
        const form = page.getByTestId('login-form')
        await form.getByLabel('E-mail').fill(email)
        await form.getByLabel('Senha', { exact: true }).fill(password)
        await form.getByRole('button', { name: 'Entrar' }).click()
        await expect(page.getByTestId('header-user-menu')).toBeVisible()
      },
    }
    await use(app)
  },
})

export { expect }
