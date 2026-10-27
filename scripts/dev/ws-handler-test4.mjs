import { ws } from 'msw'
const url = 'ws://localhost:4173/socket.io/?EIO=4&transport=websocket'
const connection = {
  client: { url: new URL(url), addEventListener() {}, send() {}, close() {} },
  server: { connect() {}, addEventListener() {} },
  info: { protocols: undefined },
}
for (const p of [
  /EIO=4/,
  /transport=websocket/,
  /^wss?:\/\/[^/]+\/\?EIO=/,
  /\?EIO=\d+&transport=websocket$/,
]) {
  const handler = ws.link(p).addEventListener('connection', () => {})
  const r = await handler.run(connection, {
    baseUrl: 'http://localhost:4173/nft/nft-002',
    quiet: true,
  })
  console.log(String(p), '->', r ? 'MATCH' : 'no match')
}
