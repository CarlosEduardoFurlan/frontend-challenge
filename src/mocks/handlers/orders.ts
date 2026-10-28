import { delay, http } from 'msw'

import { env } from '@/lib/env'
import type {
  CreateOrderRequest,
  OrderListResponse,
  WalletConnectRequest,
  WalletConnection,
} from '@/types/api'

import { httpError, json, readBody, requireUser, withScenario } from '../lib/http'
import { createOrder, findOrderForUser, listOrdersForUser, toOrder } from '../lib/order-store'
import { getCurrentScenario, scenarioFlags } from '../lib/scenario-state'
import { getDb } from '../persistence/db'

export const orderHandlers = [
  /**
   * Idempotent creation. The order is created BEFORE the (scenario) response delay, so a
   * client that times out can recover it by retrying with the same Idempotency-Key.
   */
  http.post(
    `${env.apiUrl}/orders`,
    withScenario(async ({ request }) => {
      const { user } = requireUser(request)
      const key = request.headers.get('idempotency-key')
      if (!key) throw httpError(400, 'validation_error', 'Cabeçalho Idempotency-Key obrigatório.')
      const body = await readBody<CreateOrderRequest>(request)
      const { order, created } = await createOrder(user, key, body)

      const scenario = getCurrentScenario()
      if (created && scenario.orderResponseDelayMs > 0 && !scenarioFlags.orderTimeoutApplied) {
        scenarioFlags.orderTimeoutApplied = true
        await delay(scenario.orderResponseDelayMs)
      }
      return json(toOrder(order), { status: created ? 201 : 200 })
    }),
  ),

  http.get(
    `${env.apiUrl}/orders`,
    withScenario(({ request }) => {
      const { user } = requireUser(request)
      const body: OrderListResponse = { items: listOrdersForUser(user.id).map(toOrder) }
      return json(body)
    }),
  ),

  http.get(
    `${env.apiUrl}/orders/:orderId`,
    withScenario(({ request, params }) => {
      const { user } = requireUser(request)
      const order = findOrderForUser(String(params.orderId), user.id)
      if (!order) throw httpError(404, 'not_found', 'Pedido não encontrado.')
      return json(toOrder(order))
    }),
  ),

  /** Simulated wallet connection (no extension involved). */
  http.post(
    `${env.apiUrl}/wallets/connect`,
    withScenario(async ({ request }) => {
      const { user } = requireUser(request)
      const body = await readBody<WalletConnectRequest>(request)
      const wallet = Object.values(getDb().wallets[user.id] ?? {}).find(
        (w) => w?.id === body.walletId,
      )
      if (!wallet) throw httpError(404, 'not_found', 'Carteira não encontrada.')
      const scenario = getCurrentScenario()
      if (scenario.walletConnection === 'rejected') {
        throw httpError(403, 'wallet_rejected', 'Conexão recusada na carteira simulada.')
      }
      const connection: WalletConnection = {
        walletId: wallet.id,
        address: wallet.address,
        network: body.network,
        connectedAt: new Date().toISOString(),
        sessionTtlMs: scenario.walletConnection === 'disconnect_after' ? 4000 : null,
      }
      return json(connection)
    }),
  ),
]
