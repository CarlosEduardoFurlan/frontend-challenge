import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`
const isCI = Boolean(process.env.CI)

/**
 * Playwright configuration.
 *
 * - Tests run against the production build served by `vite preview`, so MSW (service worker
 *   + WebSocket interception) is exercised exactly as in the demo deploy.
 * - `chromium-desktop` and `chromium-mobile` run the functional E2E suite.
 * - `visual` runs screenshot regression for home, detail, cart and checkout with stable
 *   fixtures. Baselines are versioned under `tests/visual/__snapshots__`.
 * - Every test starts isolated: a fresh browser context and the mock state reset via the
 *   `?mock-reset` query param handled by the mock layer.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  snapshotPathTemplate: '{testDir}/visual/__snapshots__/{projectName}/{testFilePath}/{arg}{ext}',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  projects: [
    {
      name: 'chromium-desktop',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'chromium-mobile',
      testDir: './tests/e2e',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'visual',
      testDir: './tests/visual',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
})
