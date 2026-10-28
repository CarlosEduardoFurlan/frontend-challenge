import { addEth, compareEth, maxEth, mulEth, percentOf, subEth, toEthString } from '@/lib/money'
import type { NetworkId, Quote, QuoteCoupon, QuoteLine } from '@/types/api'

import { getOrCreateCart, toCart } from './cart-store'
import { randomId, sha256 } from './crypto'
import { httpError } from './http'
import { updateEditionAvailability, updateEditionPrice } from './nft-store'
import { getCurrentScenario, scenarioFlags } from './scenario-state'
import { NETWORKS } from '../fixtures/networks'
import { getDb, persist, type QuoteRecord } from '../persistence/db'

const QUOTE_TTL_MS = 5 * 60_000

/* ----------------------------------------------------------------------------
 * Coupons
 * ------------------------------------------------------------------------- */
export function resolveCoupon(code: string, subtotalEth: string): QuoteCoupon {
  const scenario = getCurrentScenario()
  const normalised = code.trim().toUpperCase()
  if (scenario.coupon === 'invalid') {
    throw httpError(422, 'coupon_invalid', 'Cupom inválido.', {
      couponCode: ['Este cupom não existe.'],
    })
  }
  if (scenario.coupon === 'expired') {
    throw httpError(422, 'coupon_expired', 'Cupom expirado.', {
      couponCode: ['Este cupom expirou.'],
    })
  }
  const coupon = getDb().coupons.find((c) => c.code === normalised)
  if (!coupon) {
    throw httpError(422, 'coupon_invalid', 'Cupom inválido.', {
      couponCode: ['Este cupom não existe.'],
    })
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    throw httpError(422, 'coupon_expired', 'Cupom expirado.', {
      couponCode: ['Este cupom expirou.'],
    })
  }
  if (compareEth(subtotalEth, coupon.minSubtotalEth) < 0) {
    throw httpError(
      422,
      'coupon_invalid',
      `Este cupom exige subtotal mínimo de ${coupon.minSubtotalEth} ETH.`,
      {
        couponCode: [`Subtotal mínimo de ${coupon.minSubtotalEth} ETH.`],
      },
    )
  }
  return {
    code: coupon.code,
    description: coupon.description,
    type: coupon.type,
    value: coupon.value,
  }
}

function discountFor(coupon: QuoteCoupon | null, subtotalEth: string): string {
  if (!coupon) return '0'
  const raw =
    coupon.type === 'percent' ? percentOf(subtotalEth, Number(coupon.value)) : coupon.value
  // Never discount more than the subtotal.
  return compareEth(raw, subtotalEth) > 0 ? subtotalEth : toEthString(raw)
}

/* ----------------------------------------------------------------------------
 * Scenario hooks: "price changed" / "sold out" mutate the catalog once per scenario
 * activation, which also publishes nft.updated through the realtime channel.
 * ------------------------------------------------------------------------- */
function applyScenarioMutation(ownerKey: string) {
  const scenario = getCurrentScenario()
  if (scenario.quoteMutation === 'none' || scenarioFlags.quoteMutationApplied) return
  const cart = toCart(getOrCreateCart(ownerKey))
  const first = cart.items[0]
  if (!first) return
  scenarioFlags.quoteMutationApplied = true
  if (scenario.quoteMutation === 'price_changed') {
    updateEditionPrice(first.nftId, first.editionId, mulEth(first.unitPriceEth, '1.25'))
  } else {
    updateEditionAvailability(first.nftId, first.editionId, 0)
  }
}

/* ----------------------------------------------------------------------------
 * Quote
 * ------------------------------------------------------------------------- */
export async function buildQuote(
  ownerKey: string,
  network: NetworkId,
  couponOverride?: string | null,
): Promise<Quote> {
  applyScenarioMutation(ownerKey)
  const record = getOrCreateCart(ownerKey)
  const cart = toCart(record)

  const lines: QuoteLine[] = cart.items.map((item) => {
    const quantity = Math.min(item.quantity, item.available, item.maxPerOrder)
    const status: QuoteLine['status'] =
      item.available <= 0
        ? 'sold_out'
        : quantity < item.quantity
          ? 'quantity_reduced'
          : item.unitPriceEth !== item.addedPriceEth
            ? 'price_changed'
            : 'ok'
    return {
      cartItemId: item.id,
      nftId: item.nftId,
      editionId: item.editionId,
      name: item.nft.name,
      editionName: item.edition.name,
      imageUrl: item.nft.imageUrl,
      quantity: Math.max(0, quantity),
      requestedQuantity: item.quantity,
      unitPriceEth: item.unitPriceEth,
      previousUnitPriceEth: item.addedPriceEth,
      lineTotalEth: mulEth(item.unitPriceEth, Math.max(0, quantity)),
      status,
      nftVersion: item.nft.version,
    }
  })

  const subtotalEth = addEth(...lines.map((l) => l.lineTotalEth), 0)
  const couponCode = couponOverride === undefined ? record.couponCode : couponOverride
  const coupon =
    couponCode && lines.some((l) => l.quantity > 0) ? resolveCoupon(couponCode, subtotalEth) : null
  const discountEth = discountFor(coupon, subtotalEth)
  const networkFeeEth = lines.some((l) => l.quantity > 0) ? NETWORKS[network].feeEth : '0'
  const totalEth = maxEth(addEth(subEth(subtotalEth, discountEth), networkFeeEth), '0')

  const fingerprint = [
    network,
    coupon?.code ?? '',
    ...lines.map(
      (l) => `${l.cartItemId}:${l.editionId}:${l.quantity}:${l.unitPriceEth}:${l.nftVersion}`,
    ),
    subtotalEth,
    discountEth,
    networkFeeEth,
    totalEth,
  ].join('|')
  const quoteVersion = (await sha256(fingerprint)).slice(0, 16)

  const now = Date.now()
  const quote: Quote = {
    quoteId: randomId('q'),
    quoteVersion,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + QUOTE_TTL_MS).toISOString(),
    network,
    lines,
    coupon,
    subtotalEth,
    discountEth,
    networkFeeEth,
    totalEth,
    hasChanges: lines.some((l) => l.status !== 'ok'),
  }

  const db = getDb()
  const stored: QuoteRecord = {
    ...quote,
    ownerKey,
    cartVersion: record.version,
    couponCode: coupon?.code ?? null,
  }
  db.quotes = [...db.quotes.filter((q) => q.ownerKey !== ownerKey).slice(-20), stored]
  persist()
  return quote
}

export function findQuote(quoteId: string): QuoteRecord | undefined {
  return getDb().quotes.find((q) => q.quoteId === quoteId)
}
