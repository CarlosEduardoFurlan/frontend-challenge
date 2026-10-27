import type { Socket } from 'socket.io-client'

import { env } from '@/lib/env'
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/api'

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

/**
 * Creates the Socket.IO client. WebSocket-only transport: the mock server (MSW) intercepts the
 * WebSocket upgrade, while HTTP long-polling would need extra REST endpoints. The session token
 * travels in the CONNECT packet (`auth`), so the server can scope private events.
 *
 * `socket.io-client` is imported lazily on purpose: engine.io-client captures the global
 * `WebSocket` constructor when its module is evaluated, and MSW only patches that global when
 * the worker starts. Importing after `enableMocking()` guarantees the interceptable constructor
 * is used (and keeps the client out of the initial bundle).
 */
export async function createSocket(token: string | null): Promise<AppSocket> {
  const { io } = await import('socket.io-client')
  return io(env.socketUrl, {
    path: '/socket.io',
    transports: ['websocket'],
    upgrade: false,
    auth: token ? { token } : {},
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionDelayMax: 4000,
    randomizationFactor: 0.2,
    timeout: 10_000,
  })
}
