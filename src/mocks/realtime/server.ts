import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws, type WebSocketHandlerConnection } from 'msw'

import type { NftUpdatedEvent, OrderUpdatedEvent } from '@/types/api'

import { mockEventBus } from '../lib/event-bus'
import { getDb } from '../persistence/db'

/**
 * Socket.IO mock server on top of MSW WebSocket interception.
 *
 * Transport: the real `socket.io-client` opens a WebSocket to `/socket.io/?EIO=4&transport=websocket`
 * (websocket only, no polling). MSW intercepts it in the page and `@mswjs/socket.io-binding`
 * encodes/decodes Socket.IO packets so this module emits events with the Socket.IO protocol.
 *
 * Known limitations of the binding and how they are handled here:
 * - it answers the handshake (OPEN + CONNECT) but never pings: the client would drop the
 *   connection by "ping timeout" after ~30s, so this server sends engine.io pings itself;
 * - it ignores the CONNECT payload, so the bearer token sent as `auth` is parsed from the raw
 *   "40{...}" packet to bind the connection to a user;
 * - no rooms/namespaces: user scoping is done by filtering connections by userId.
 */
interface ClientConnection {
  id: string
  connection: WebSocketHandlerConnection
  io: ReturnType<typeof toSocketIo>
  userId: string | null
  pingTimer: ReturnType<typeof setInterval> | null
}

const PING_INTERVAL_MS = 25_000
const connections = new Map<string, ClientConnection>()
let sequence = 0
let busBound = false

/**
 * Why `'*'`: MSW strips the "/socket.io/" prefix from the client URL before matching, and
 * browsers percent-encode a `*` host (`ws://*` becomes `ws://%2A/`), so neither a path nor a
 * host wildcard can target the Socket.IO endpoint. Every WebSocket is therefore intercepted and
 * non-Socket.IO connections (e.g. Vite HMR in development) are passed through untouched.
 */
const link = ws.link('*')

function resolveUserId(token: unknown): string | null {
  if (typeof token !== 'string' || !token) return null
  const session = getDb().sessions.find((s) => s.token === token)
  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) return null
  return session.userId
}

function bindBusOnce() {
  if (busBound) return
  busBound = true
  mockEventBus.on('nft.updated', (event) => broadcastNft(event))
  mockEventBus.on('order.updated', (event) => {
    const { userId, ...payload } = event
    for (const client of connections.values()) {
      if (client.userId === userId) client.io.client.emit('order.updated', payload)
    }
  })
}

function broadcastNft(event: NftUpdatedEvent) {
  for (const client of connections.values()) client.io.client.emit('nft.updated', event)
}

function isSocketIoUrl(url: URL | string): boolean {
  return new URL(url.toString()).pathname.startsWith('/socket.io/')
}

function handleConnection(connection: WebSocketHandlerConnection) {
  if (!isSocketIoUrl(connection.client.url)) {
    connection.server.connect()
    return
  }
  bindBusOnce()
  const id = `sock_${++sequence}`
  const io = toSocketIo(connection)
  const client: ClientConnection = { id, connection, io, userId: null, pingTimer: null }
  connections.set(id, client)

  // Raw packets: CONNECT ("40{auth}") carries the session token; "3" is the pong reply.
  connection.client.addEventListener('message', (event) => {
    if (typeof event.data !== 'string') return
    if (event.data.startsWith('40')) {
      try {
        const auth = JSON.parse(event.data.slice(2) || '{}') as { token?: string }
        client.userId = resolveUserId(auth.token)
      } catch {
        client.userId = null
      }
    }
  })

  client.pingTimer = setInterval(() => {
    try {
      connection.client.send('2')
    } catch {
      cleanup(id)
    }
  }, PING_INTERVAL_MS)

  connection.client.addEventListener('close', () => cleanup(id))
}

function cleanup(id: string) {
  const client = connections.get(id)
  if (!client) return
  if (client.pingTimer) clearInterval(client.pingTimer)
  connections.delete(id)
}

export const realtimeHandlers = [link.addEventListener('connection', handleConnection)]

export function getConnectedSocketCount(): number {
  return connections.size
}

/** User ids bound to the open connections (null for guests). Used by tests and the panel. */
export function getConnectedUsers(): Array<string | null> {
  return [...connections.values()].map((c) => c.userId)
}

/** Simulates a network interruption: every client is closed and must reconnect. */
export function dropAllSockets(): number {
  const count = connections.size
  for (const client of [...connections.values()]) {
    cleanup(client.id)
    try {
      client.connection.client.close(1006, 'Simulated network interruption')
    } catch {
      // already closed
    }
  }
  return count
}

/** Emits an arbitrary event to every connection (used by replay helpers). */
export function emitToAll(type: 'nft.updated', event: NftUpdatedEvent): void
export function emitToAll(
  type: 'order.updated',
  event: OrderUpdatedEvent & { userId: string },
): void
export function emitToAll(
  type: 'nft.updated' | 'order.updated',
  event: NftUpdatedEvent | (OrderUpdatedEvent & { userId: string }),
) {
  if (type === 'nft.updated') broadcastNft(event as NftUpdatedEvent)
  else mockEventBus.emit('order.updated', event as OrderUpdatedEvent & { userId: string })
}
