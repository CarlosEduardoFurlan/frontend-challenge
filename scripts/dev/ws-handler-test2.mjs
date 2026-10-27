import { ws } from 'msw'
const url = 'ws://localhost:4173/socket.io/?EIO=4&transport=websocket'
const connection = {
  client: { url, addEventListener() {}, send() {}, close() {} },
  server: { connect() {}, addEventListener() {} },
  info: { protocols: undefined },
}
const patterns = [
  'ws://*/socket.io/*',
  '*/socket.io/*',
  '*',
  'ws://localhost:4173/socket.io/*',
  'ws://localhost:4173/socket.io/',
  'ws://*',
  'ws://*/socket.io/',
  /socket\.io/,
  /\/socket\.io\//,
  'ws://*/socket.io',
]
for (const p of patterns) {
  const handler = ws.link(p).addEventListener('connection', () => {})
  for (const ctx of [{}, { baseUrl: 'http://localhost:4173/nft/x' }]) {
    try {
      const r = await handler.run(connection, ctx)
      console.log(String(p), JSON.stringify(ctx), '->', r ? 'MATCH' : 'no match')
    } catch (e) {
      console.log(String(p), 'ERR', e.message.slice(0, 80))
    }
  }
}
