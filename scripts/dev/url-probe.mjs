import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:4173/')
console.log(
  await page.evaluate(() => {
    const out = {}
    for (const u of ['ws://*', 'ws://*/', 'wss://*', 'ws://*:*', 'ws://localhost:4173/']) {
      try {
        out[u] = new URL(u).href
      } catch (e) {
        out[u] = 'THROWS ' + e.message
      }
    }
    return out
  }),
)
await browser.close()
