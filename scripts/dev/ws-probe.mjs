import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:4173/?mock-reset=1')
await page.waitForFunction(() => Boolean(window.__mock))
await page.waitForTimeout(500)
console.log(
  await page.evaluate(() => ({
    wsName: window.WebSocket.name,
    wsSource: window.WebSocket.toString().slice(0, 120),
    hasSymbolPatched: Object.getOwnPropertySymbols(window.WebSocket).map(String),
  })),
)
// Try a raw WebSocket to the socket.io path and see if it opens (intercepted) or errors.
console.log(
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        const ws = new WebSocket('ws://localhost:4173/socket.io/?EIO=4&transport=websocket')
        ws.onopen = () => resolve('raw ws OPEN (intercepted)')
        ws.onerror = () => resolve('raw ws ERROR (not intercepted)')
        setTimeout(() => resolve('raw ws timeout'), 3000)
      }),
  ),
)
await browser.close()
