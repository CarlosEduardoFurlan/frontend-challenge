/**
 * Stress test for the login flow: repeats the UI login N times with concurrent browser contexts
 * (mirrors the parallel Playwright workers) and reports every failure with the network
 * requests that were in flight. Used to investigate the intermittent login E2E failure.
 *
 * Usage: node scripts/dev/login-stress.mjs http://localhost:4173 [iterations=20] [concurrency=6]
 */
import { chromium } from '@playwright/test'

const [baseUrl = 'http://localhost:4173', iterationsArg = '20', concurrencyArg = '6'] =
  process.argv.slice(2)
const iterations = Number(iterationsArg)
const concurrency = Number(concurrencyArg)
const browser = await chromium.launch()
const failures = []
let completed = 0
const durations = []

async function attempt(index) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  const requests = []
  page.on('requestfailed', (request) =>
    requests.push(`${request.method()} ${request.url()} -> ${request.failure()?.errorText}`),
  )
  page.on('console', (message) => {
    if (message.type() === 'error') requests.push(`console.error: ${message.text()}`)
  })
  const started = Date.now()
  try {
    await page.goto(`${baseUrl}/login?mock-reset=1`)
    await page.waitForFunction(() => Boolean(window.__mock))
    const form = page.getByTestId('login-form')
    await form.getByLabel('E-mail').fill('ana@example.com')
    await form.getByLabel('Senha', { exact: true }).fill('Senha@123')
    await form.getByRole('button', { name: 'Entrar' }).click()
    await page.getByTestId('header-user-menu').waitFor({ timeout: 10_000 })
    durations.push(Date.now() - started)
  } catch (error) {
    const formError = await page
      .getByTestId('form-error')
      .textContent()
      .catch(() => null)
    failures.push({ index, error: String(error).split('\n')[0], formError, requests })
  } finally {
    completed += 1
    await context.close()
  }
}

const queue = Array.from({ length: iterations }, (_, i) => i)
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (queue.length) await attempt(queue.shift())
  }),
)
await browser.close()

durations.sort((a, b) => a - b)
console.log(
  `logins: ${completed}, failures: ${failures.length}, median ${durations[Math.floor(durations.length / 2)]} ms, max ${durations.at(-1)} ms`,
)
for (const failure of failures) console.log(JSON.stringify(failure, null, 2))
process.exit(failures.length ? 1 : 0)
