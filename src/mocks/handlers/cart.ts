import { http } from 'msw'

import { env } from '@/lib/env'
import type {
  AddCartItemRequest,
  MergeCartRequest,
  NetworkId,
  QuoteRequest,
  UpdateCartItemRequest,
} from '@/types/api'

import {
  addItem,
  getOrCreateCart,
  mergeCarts,
  removeItem,
  setCoupon,
  toCart,
  updateItem,
} from '../lib/cart-store'
import { cartOwnerKey, httpError, json, readBody, requireUser, withScenario } from '../lib/http'
import { buildQuote, resolveCoupon } from '../lib/quote-store'
import { NETWORKS } from '../fixtures/networks'

function parseNetwork(value: unknown): NetworkId {
  if (typeof value === 'string' && value in NETWORKS) return value as NetworkId
  return 'ethereum'
}

export const cartHandlers = [
  http.get(
    `${env.apiUrl}/cart`,
    withScenario(({ request }) => json(toCart(getOrCreateCart(cartOwnerKey(request))))),
  ),

  http.post(
    `${env.apiUrl}/cart/items`,
    withScenario(async ({ request }) => {
      const body = await readBody<AddCartItemRequest>(request)
      if (!body.nftId || !body.editionId)
        throw httpError(422, 'validation_error', 'Informe NFT e edição.')
      const cart = addItem(cartOwnerKey(request), body.nftId, body.editionId, Number(body.quantity))
      return json(toCart(cart), { status: 201 })
    }),
  ),

  http.patch(
    `${env.apiUrl}/cart/items/:itemId`,
    withScenario(async ({ request, params }) => {
      const body = await readBody<UpdateCartItemRequest>(request)
      const cart = updateItem(cartOwnerKey(request), String(params.itemId), Number(body.quantity))
      return json(toCart(cart))
    }),
  ),

  http.delete(
    `${env.apiUrl}/cart/items/:itemId`,
    withScenario(({ request, params }) => {
      const cart = removeItem(cartOwnerKey(request), String(params.itemId))
      return json(toCart(cart))
    }),
  ),

  /** Validates the coupon against the current cart and stores it. */
  http.put(
    `${env.apiUrl}/cart/coupon`,
    withScenario(async ({ request }) => {
      const body = await readBody<{ code?: string }>(request)
      const code = body.code?.trim().toUpperCase()
      if (!code)
        throw httpError(422, 'validation_error', 'Informe o código do cupom.', {
          couponCode: ['Informe o código.'],
        })
      const ownerKey = cartOwnerKey(request)
      const cart = toCart(getOrCreateCart(ownerKey))
      if (cart.items.length === 0)
        throw httpError(422, 'coupon_invalid', 'Adicione itens antes de aplicar um cupom.')
      const coupon = resolveCoupon(code, cart.subtotalEth)
      return json(toCart(setCoupon(ownerKey, coupon.code)))
    }),
  ),

  http.delete(
    `${env.apiUrl}/cart/coupon`,
    withScenario(({ request }) => json(toCart(setCoupon(cartOwnerKey(request), null)))),
  ),

  /** Authenticated only: merges the guest cart into the user's cart after login. */
  http.post(
    `${env.apiUrl}/cart/merge`,
    withScenario(async ({ request }) => {
      const { user } = requireUser(request)
      const body = await readBody<MergeCartRequest>(request)
      if (!body.guestCartId)
        throw httpError(422, 'validation_error', 'Informe o carrinho de visitante.')
      return json(toCart(mergeCarts(`guest:${body.guestCartId}`, `user:${user.id}`)))
    }),
  ),

  /** Pricing: revalidates availability, prices, coupon and fees. */
  http.post(
    `${env.apiUrl}/cart/quote`,
    withScenario(async ({ request }) => {
      const body = await readBody<QuoteRequest>(request).catch(() => ({}) as QuoteRequest)
      const quote = await buildQuote(
        cartOwnerKey(request),
        parseNetwork(body.network),
        body.couponCode,
      )
      return json(quote)
    }),
  ),
]
