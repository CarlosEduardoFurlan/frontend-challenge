import type { NftUpdatedEvent } from '@/types/api'

import { replayNftEvent, updateEditionAvailability, updateEditionPrice } from './lib/nft-store'
import { getCurrentScenarioId, setScenario } from './lib/scenario-state'
import { replayOrderEvent, settlePendingOrders } from './lib/order-store'
import { getDb, persist, resetDb } from './persistence/db'
import { listScenarios } from './scenarios'

/**
 * `window.__mock`: programmatic control surface used by Playwright and by the mock panel.
 * Every function goes through the same store code as the REST control endpoints, so events
 * triggered here still travel through the Socket.IO mock server and `socket.io-client`.
 */
export interface MockControlApi {
  getScenario(): string
  setScenario(id: string): string
  listScenarios(): ReturnType<typeof listScenarios>
  reset(): Promise<void>
  /** Expires every active session server-side (simulates token revocation / TTL end). */
  expireSessions(): number
  /** Settles every pending order immediately (confirmed by default). */
  settlePendingOrders(outcome?: 'confirmed' | 'rejected'): number
  replayOrderEvent(orderId: string, overrides?: { eventId?: string; version?: number }): unknown
  updatePrice(nftId: string, editionId: string, priceEth: string): NftUpdatedEvent | null
  updateAvailability(nftId: string, editionId: string, available: number): NftUpdatedEvent | null
  replayNftEvent(
    nftId: string,
    overrides?: { eventId?: string; version?: number },
  ): NftUpdatedEvent | null
}

declare global {
  interface Window {
    __mock?: MockControlApi
  }
}

export function expireSessions(): number {
  const db = getDb()
  const past = new Date(Date.now() - 1000).toISOString()
  db.sessions.forEach((session) => (session.expiresAt = past))
  persist()
  return db.sessions.length
}

export function installMockControl(): void {
  window.__mock = {
    getScenario: getCurrentScenarioId,
    setScenario: (id) => setScenario(id).id,
    listScenarios,
    reset: async () => {
      await resetDb()
    },
    expireSessions,
    settlePendingOrders,
    replayOrderEvent,
    updatePrice: updateEditionPrice,
    updateAvailability: updateEditionAvailability,
    replayNftEvent,
  }
}
