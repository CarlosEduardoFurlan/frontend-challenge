import { http } from 'msw'

import { env } from '@/lib/env'
import type { MockStatus } from '@/types/api'

import { httpError, json, readBody, withScenario } from '../lib/http'
import { replayNftEvent, updateEditionAvailability, updateEditionPrice } from '../lib/nft-store'
import { getCurrentScenarioId, setScenario } from '../lib/scenario-state'
import { getDb, resetDb } from '../persistence/db'
import { expireSessions } from '../control'
import { settlePendingOrders } from '../lib/order-store'
import { listScenarios } from '../scenarios'
import { getConnectedSocketCount } from '../realtime/server'

/**
 * Mock control endpoints. They are not part of the product API: they exist so the demo build,
 * the in-app mock panel and the Playwright suite can select scenarios, reset state and
 * trigger realtime events in a reproducible way. All of them bypass latency/failure injection.
 */
export function buildStatus(): MockStatus {
  return {
    scenario: getCurrentScenarioId(),
    scenarios: listScenarios(),
    seededAt: getDb().seededAt,
    connectedSockets: getConnectedSocketCount(),
  }
}

export const controlHandlers = [
  http.get(
    `${env.apiUrl}/__mock/status`,
    withScenario(() => json(buildStatus()), { bypass: true }),
  ),

  http.post(
    `${env.apiUrl}/__mock/scenario`,
    withScenario(
      async ({ request }) => {
        const body = await readBody<{ id?: string }>(request)
        if (!body.id) throw httpError(400, 'validation_error', 'Informe o id do cenário.')
        setScenario(body.id)
        return json(buildStatus())
      },
      { bypass: true },
    ),
  ),

  http.post(
    `${env.apiUrl}/__mock/reset`,
    withScenario(
      async () => {
        await resetDb()
        return json(buildStatus())
      },
      { bypass: true },
    ),
  ),

  http.post(
    `${env.apiUrl}/__mock/session/expire`,
    withScenario(() => json({ expired: expireSessions() }), { bypass: true }),
  ),

  http.post(
    `${env.apiUrl}/__mock/orders/settle`,
    withScenario(
      async ({ request }) => {
        type SettleBody = { outcome?: 'confirmed' | 'rejected' }
        const body = await readBody<SettleBody>(request).catch((): SettleBody => ({}))
        return json({ settled: settlePendingOrders(body.outcome) })
      },
      { bypass: true },
    ),
  ),

  http.post(
    `${env.apiUrl}/__mock/nfts/:nftId/price`,
    withScenario(
      async ({ request, params }) => {
        const body = await readBody<{ editionId: string; priceEth: string }>(request)
        const event = updateEditionPrice(String(params.nftId), body.editionId, body.priceEth)
        if (!event) throw httpError(404, 'not_found', 'NFT ou edição não encontrados.')
        return json(event)
      },
      { bypass: true },
    ),
  ),

  http.post(
    `${env.apiUrl}/__mock/nfts/:nftId/availability`,
    withScenario(
      async ({ request, params }) => {
        const body = await readBody<{ editionId: string; available: number }>(request)
        const event = updateEditionAvailability(
          String(params.nftId),
          body.editionId,
          body.available,
        )
        if (!event) throw httpError(404, 'not_found', 'NFT ou edição não encontrados.')
        return json(event)
      },
      { bypass: true },
    ),
  ),

  http.post(
    `${env.apiUrl}/__mock/nfts/:nftId/replay`,
    withScenario(
      async ({ request, params }) => {
        const body = await readBody<{ eventId?: string; version?: number }>(request)
        const event = replayNftEvent(String(params.nftId), body)
        if (!event) throw httpError(404, 'not_found', 'NFT não encontrado.')
        return json(event)
      },
      { bypass: true },
    ),
  ),
]
