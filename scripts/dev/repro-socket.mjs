import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('console', (m) => {
  if (['error', 'warning'].includes(m.type()))
    console.log('[console]', m.type(), m.text().slice(0, 300))
})
page.on('websocket', (ws) => {
  console.log('[ws open]', ws.url())
  ws.on('framesent', (f) => console.log('[ws >]', String(f.payload).slice(0, 80)))
  ws.on('framereceived', (f) => console.log('[ws <]', String(f.payload).slice(0, 80)))
  ws.on('close', () => console.log('[ws close]'))
})
await page.goto('http://localhost:4173/nft/nft-002?mock-reset=1')
await page.getByTestId('nft-detail').waitFor()
await page.waitForTimeout(1500)
console.log(
  'status:',
  await page.getByTestId('realtime-status').getAttribute('data-state'),
  'sockets:',
  await page.evaluate(() => window.__mock.socketCount()),
)
console.log(
  'version before:',
  await page.getByTestId('nft-detail').getAttribute('data-nft-version'),
)
await page.evaluate(() => window.__mock.updatePrice('nft-002', 'nft-002-std', '0.2'))
await page.waitForTimeout(800)
console.log(
  'version after:',
  await page.getByTestId('nft-detail').getAttribute('data-nft-version'),
  'toasts:',
  await page.getByTestId('toast').allTextContents(),
)
console.log('drop:', await page.evaluate(() => window.__mock.dropSockets()))
await page.waitForTimeout(300)
console.log(
  'status after drop:',
  await page.getByTestId('realtime-status').getAttribute('data-state'),
)
await page.waitForTimeout(2500)
console.log(
  'status after wait:',
  await page.getByTestId('realtime-status').getAttribute('data-state'),
  'sockets:',
  await page.evaluate(() => window.__mock.socketCount()),
)
await browser.close()
