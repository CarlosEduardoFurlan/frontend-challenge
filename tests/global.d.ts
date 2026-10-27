/**
 * Minimal typing of the `window.__mock` control surface used by tests via `page.evaluate`.
 * The full implementation lives in `src/mocks/control.ts`.
 */
interface MockControlApiForTests {
  getScenario(): string
  setScenario(id: string): string
  reset(): Promise<void>
  expireSessions(): number
  updatePrice(nftId: string, editionId: string, priceEth: string): unknown
  updateAvailability(nftId: string, editionId: string, available: number): unknown
  replayNftEvent(nftId: string, overrides?: { eventId?: string; version?: number }): unknown
}

interface Window {
  __mock?: MockControlApiForTests
}
