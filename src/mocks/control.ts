import type { NftUpdatedEvent } from '@/types/api'

import { replayNftEvent, updateEditionAvailability, updateEditionPrice } from './lib/nft-store'
import { getCurrentScenarioId, setScenario } from './lib/scenario-state'
import { resetDb } from './persistence/db'
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

export function installMockControl(): void {
  window.__mock = {
    getScenario: getCurrentScenarioId,
    setScenario: (id) => setScenario(id).id,
    listScenarios,
    reset: async () => {
      await resetDb()
    },
    updatePrice: updateEditionPrice,
    updateAvailability: updateEditionAvailability,
    replayNftEvent,
  }
}
