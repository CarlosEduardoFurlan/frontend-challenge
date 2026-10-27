import { matchRequestUrl } from 'msw'
const url = new URL('ws://localhost:4173/socket.io/?EIO=4&transport=websocket')
for (const p of [
  'ws://*/socket.io/*',
  'ws://*/socket.io/',
  '*/socket.io/*',
  'ws://localhost:4173/socket.io/',
  'ws://*:*/socket.io/*',
  '*',
  'ws://*',
  'ws://*/socket.io',
]) {
  try {
    console.log(JSON.stringify(p), '->', matchRequestUrl(url, p).matches)
  } catch (e) {
    console.log(JSON.stringify(p), 'ERR', e.message)
  }
}
