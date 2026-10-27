import { defineConfig } from '@playwright/test'

import baseConfig from './playwright.config'

/**
 * Runs the same E2E projects against a published deployment instead of the local preview.
 *
 *   REMOTE_BASE_URL=https://<deployment>.vercel.app npx playwright test --config=playwright.remote.config.ts
 *
 * The mock layer (MSW + Socket.IO binding) ships with the production build, so every suite
 * works unchanged; only the server and the visual projects (platform-specific baselines) differ.
 */
const baseURL = process.env.REMOTE_BASE_URL
if (!baseURL) throw new Error('REMOTE_BASE_URL is required, e.g. https://example.vercel.app')

export default defineConfig({
  ...baseConfig,
  webServer: undefined,
  retries: 1,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-remote' }]],
  use: { ...baseConfig.use, baseURL },
  projects: (baseConfig.projects ?? []).filter((project) => project.name?.startsWith('chromium')),
})
