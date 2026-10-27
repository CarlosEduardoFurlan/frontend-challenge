import type { CreateOrderRequest, Order, OrderUpdatedEvent } from '@/types/api'

import { consumeItems } from './cart-store'
import { fakeTxHash, randomId, sha256 } from './crypto'
import { mockEventBus } from './event-bus'
import { httpError } from './http'
import { consumeStock, findNft } from './nft-store'
import { buildQuote, findQuote } from './quote-store'
import { getCurrentScenario } from './scenario-state'
import { NETWORKS } from '../fixtures/networks'
import { getDb, nextEventId, persist, type OrderRecord, type UserRecord } from '../persistence/db'

const timers = new Map<string, ReturnType<typeof setTimeout>>()

/* ----------------------------------------------------------------------------
 * Projection
 * ------------------------------------------------------------------------- */
export function toOrder(record: OrderRecord): Order {
  const {
    userId: _userId,
    idempotencyKey: _k,
    payloadHash: _h,
    settleAt: _s,
    settleOutcome: _o,
    cartItemIds: _c,
    ...order
  } = record
  return order
}

export function findOrderForUser(orderId: string, userId: string): OrderRecord | undefined {
  return getDb().orders.find((o) => o.id === orderId && o.userId === userId)
}

export function listOrdersForUser(userId: string): OrderRecord[] {
  return getDb()
    .orders.filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/* ----------------------------------------------------------------------------
 * Creation (idempotent)
 * ------------------------------------------------------------------------- */
export async function payloadHash(body: CreateOrderRequest): Promise<string> {
  const { quoteId, quoteVersion, walletId, network, collector } = body
  return sha256(JSON.stringify({ quoteId, quoteVersion, walletId, network, collector }))
}

export async function createOrder(
  user: UserRecord,
  idempotencyKey: string,
  body: CreateOrderRequest,
): Promise<{ order: OrderRecord; created: boolean }> {
  const db = getDb()
  const hash = await payloadHash(body)
  const existing = db.orders.find(
    (o) => o.userId === user.id && o.idempotencyKey === idempotencyKey,
  )
  if (existing) {
    if (existing.payloadHash !== hash) {
      throw httpError(
        409,
        'idempotency_conflict',
        'Esta chave de idempotência já foi usada com outro conteúdo.',
      )
    }
    return { order: existing, created: false }
  }

  if (!body.acceptedTerms) {
    throw httpError(422, 'validation_error', 'Aceite os termos para continuar.', {
      acceptedTerms: ['Aceite os termos para continuar.'],
    })
  }
  if (!(body.network in NETWORKS)) throw httpError(422, 'validation_error', 'Rede inválida.')

  const wallet = Object.values(db.wallets[user.id] ?? {}).find((w) => w?.id === body.walletId)
  if (!wallet)
    throw httpError(422, 'validation_error', 'Selecione uma carteira cadastrada.', {
      walletId: ['Carteira inválida.'],
    })

  const ownerKey = `user:${user.id}`
  const storedQuote = findQuote(body.quoteId)
  if (!storedQuote || storedQuote.ownerKey !== ownerKey) {
    throw httpError(
      409,
      'quote_expired',
      'Cotação não encontrada. Revise os valores e tente novamente.',
    )
  }
  if (new Date(storedQuote.expiresAt).getTime() < Date.now()) {
    throw httpError(409, 'quote_expired', 'A cotação expirou. Revise os valores atualizados.')
  }
  // Re-price right now: any change in price, availability, coupon or fee invalidates the order.
  const fresh = await buildQuote(ownerKey, body.network)
  if (fresh.quoteVersion !== body.quoteVersion || storedQuote.quoteVersion !== body.quoteVersion) {
    throw httpError(
      409,
      'price_changed',
      'Os valores mudaram desde a sua revisão. Confirme a nova cotação.',
    )
  }
  const lines = fresh.lines.filter((l) => l.quantity > 0)
  if (lines.length === 0)
    throw httpError(409, 'availability_conflict', 'Nenhum item disponível para compra.')
  for (const line of lines) {
    const nft = findNft(line.nftId)
    const edition = nft?.editions.find((e) => e.id === line.editionId)
    if (!edition || edition.available < line.quantity) {
      throw httpError(
        409,
        'availability_conflict',
        `Disponibilidade insuficiente para "${line.name}".`,
      )
    }
  }

  const scenario = getCurrentScenario()
  const now = new Date().toISOString()
  const order: OrderRecord = {
    id: randomId('ord'),
    status: 'pending',
    version: 1,
    createdAt: now,
    updatedAt: now,
    network: body.network,
    wallet: { id: wallet.id, label: wallet.label, address: wallet.address, kind: wallet.kind },
    collector: body.collector,
    items: lines.map((l) => ({
      nftId: l.nftId,
      editionId: l.editionId,
      name: l.name,
      editionName: l.editionName,
      imageUrl: l.imageUrl,
      quantity: l.quantity,
      unitPriceEth: l.unitPriceEth,
      lineTotalEth: l.lineTotalEth,
    })),
    coupon: fresh.coupon,
    subtotalEth: fresh.subtotalEth,
    discountEth: fresh.discountEth,
    networkFeeEth: fresh.networkFeeEth,
    totalEth: fresh.totalEth,
    txHash: null,
    explorerUrl: null,
    rejectionReason: null,
    userId: user.id,
    idempotencyKey,
    payloadHash: hash,
    settleAt: scenario.orderOutcome === 'pending' ? null : Date.now() + scenario.orderSettleDelayMs,
    settleOutcome: scenario.orderOutcome,
    cartItemIds: lines.map((l) => l.cartItemId),
  }
  db.orders.push(order)
  persist()
  scheduleSettlement(order)
  return { order, created: true }
}

/* ----------------------------------------------------------------------------
 * Settlement (simulated payment)
 * ------------------------------------------------------------------------- */
function publishOrderUpdated(order: OrderRecord) {
  const event: OrderUpdatedEvent & { userId: string } = {
    eventId: nextEventId(),
    type: 'order.updated',
    resourceId: order.id,
    version: order.version,
    emittedAt: new Date().toISOString(),
    userId: order.userId,
    payload: {
      status: order.status,
      txHash: order.txHash,
      explorerUrl: order.explorerUrl,
      rejectionReason: order.rejectionReason,
      updatedAt: order.updatedAt,
    },
  }
  mockEventBus.emit('order.updated', event)
}

export function settleOrder(
  orderId: string,
  outcome?: 'confirmed' | 'rejected',
): OrderRecord | null {
  const order = getDb().orders.find((o) => o.id === orderId)
  if (!order || order.status !== 'pending') return order ?? null
  const result = outcome ?? (order.settleOutcome === 'pending' ? 'confirmed' : order.settleOutcome)
  clearTimeout(timers.get(orderId))
  timers.delete(orderId)

  order.version += 1
  order.updatedAt = new Date().toISOString()
  order.settleAt = null
  if (result === 'confirmed') {
    order.status = 'confirmed'
    order.txHash = fakeTxHash()
    order.explorerUrl = `${NETWORKS[order.network].explorerBaseUrl}${order.txHash}`
    // Stock and cart are only touched after the payment is confirmed.
    for (const item of order.items) consumeStock(item.nftId, item.editionId, item.quantity)
    consumeItems(
      `user:${order.userId}`,
      order.items.map((item, index) => ({
        cartItemId: order.cartItemIds[index] ?? '',
        quantity: item.quantity,
      })),
    )
  } else {
    order.status = 'rejected'
    order.rejectionReason = 'Pagamento recusado pela carteira simulada. Nenhum valor foi debitado.'
  }
  persist()
  publishOrderUpdated(order)
  return order
}

export function scheduleSettlement(order: OrderRecord) {
  if (order.status !== 'pending' || order.settleAt === null) return
  clearTimeout(timers.get(order.id))
  const wait = Math.max(300, order.settleAt - Date.now())
  timers.set(
    order.id,
    setTimeout(() => settleOrder(order.id), wait),
  )
}

/** Called at boot: pending orders keep settling after a refresh or a reconnection. */
export function resumePendingOrders() {
  for (const order of getDb().orders) scheduleSettlement(order)
}

/** Test/demo helper: settles every pending order right away. */
export function settlePendingOrders(outcome?: 'confirmed' | 'rejected'): number {
  const pending = getDb().orders.filter((o) => o.status === 'pending')
  pending.forEach((o) => settleOrder(o.id, outcome))
  return pending.length
}

/** Replays the last order.updated event (used to test duplicate/old event handling). */
export function replayOrderEvent(
  orderId: string,
  overrides?: { eventId?: string; version?: number },
) {
  const order = getDb().orders.find((o) => o.id === orderId)
  if (!order) return null
  const event: OrderUpdatedEvent & { userId: string } = {
    eventId: overrides?.eventId ?? nextEventId(),
    type: 'order.updated',
    resourceId: order.id,
    version: overrides?.version ?? order.version,
    emittedAt: new Date().toISOString(),
    userId: order.userId,
    payload: {
      status: order.status,
      txHash: order.txHash,
      explorerUrl: order.explorerUrl,
      rejectionReason: order.rejectionReason,
      updatedAt: order.updatedAt,
    },
  }
  mockEventBus.emit('order.updated', event)
  return event
}
