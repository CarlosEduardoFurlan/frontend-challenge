// Replicates the browser flow: setupServer-less handler lookup through msw core with the real handlers module is not
// possible in Node (browser-only imports), so test the exact pattern + a protocol-less variant with resolutionContext.
import { ws } from 'msw'
const url = 'ws://localhost:4173/socket.io/?EIO=4&transport=websocket'
const connection = {
  client: { url: new URL(url), addEventListener() {}, send() {}, close() {} },
  server: { connect() {}, addEventListener() {} },
  info: { protocols: undefined },
}
for (const p of ['ws://*', 'wss://*', '*']) {
  const handler = ws.link(p).addEventListener('connection', () => {})
  const r = await handler.run(connection, {
    baseUrl: 'http://localhost:4173/nft/nft-002',
    quiet: true,
  })
  console.log(p, '(URL object) ->', r ? 'MATCH' : 'no match')
}
