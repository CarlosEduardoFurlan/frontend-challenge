import { ws } from 'msw'
const handler = ws.link('ws://*/socket.io/*').addEventListener('connection', () => {})
const connection = {
  client: {
    url: 'ws://localhost:4173/socket.io/?EIO=4&transport=websocket',
    addEventListener() {},
    send() {},
    close() {},
  },
  server: { connect() {}, addEventListener() {} },
  info: { protocols: undefined },
}
for (const ctx of [
  {},
  { baseUrl: 'http://localhost:4173/' },
  { baseUrl: 'http://localhost:4173/nft/nft-002' },
]) {
  try {
    const r = await handler.run(connection, ctx)
    console.log(JSON.stringify(ctx), '->', r ? 'MATCH' : 'no match')
  } catch (e) {
    console.log(JSON.stringify(ctx), 'ERR', e.message)
  }
}
