import { addEth, mulEth } from '@/lib/money'
import type { Cart, CartItem } from '@/types/api'

import { randomId } from './crypto'
import { httpError } from './http'
import { findNft } from './nft-store'
import { getDb, persist, type CartItemRecord, type CartRecord } from '../persistence/db'

/* ----------------------------------------------------------------------------
 * Lookup
 * ------------------------------------------------------------------------- */
export function getOrCreateCart(ownerKey: string): CartRecord {
  const db = getDb()
  let cart = db.carts.find((c) => c.ownerKey === ownerKey)
  if (!cart) {
    cart = {
      id: randomId('cart'),
      ownerKey,
      items: [],
      couponCode: null,
      updatedAt: new Date().toISOString(),
      version: 1,
    }
    db.carts.push(cart)
    persist()
  }
  return cart
}

function touch(cart: CartRecord) {
  cart.updatedAt = new Date().toISOString()
  cart.version += 1
  persist()
}

/* ----------------------------------------------------------------------------
 * Projection: cart items always reflect the CURRENT catalog price/availability.
 * ------------------------------------------------------------------------- */
export function toCart(cart: CartRecord): Cart {
  const items: CartItem[] = []
  for (const item of cart.items) {
    const nft = findNft(item.nftId)
    const edition = nft?.editions.find((e) => e.id === item.editionId)
    if (!nft || !edition) continue
    items.push({
      id: item.id,
      nftId: nft.id,
      editionId: edition.id,
      quantity: item.quantity,
      addedPriceEth: item.addedPriceEth,
      unitPriceEth: edition.priceEth,
      lineTotalEth: mulEth(edition.priceEth, item.quantity),
      available: edition.available,
      maxPerOrder: edition.maxPerOrder,
      nft: {
        id: nft.id,
        name: nft.name,
        collection: nft.collection,
        imageUrl: nft.imageUrl,
        version: nft.version,
      },
      edition: { id: edition.id, name: edition.name },
    })
  }
  return {
    id: cart.id,
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotalEth: addEth(...items.map((i) => i.lineTotalEth), 0),
    couponCode: cart.couponCode,
    updatedAt: cart.updatedAt,
    version: cart.version,
  }
}

/* ----------------------------------------------------------------------------
 * Mutations
 * ------------------------------------------------------------------------- */
function assertQuantity(nftId: string, editionId: string, quantity: number) {
  const nft = findNft(nftId)
  const edition = nft?.editions.find((e) => e.id === editionId)
  if (!nft || !edition) throw httpError(404, 'not_found', 'NFT ou edição não encontrados.')
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw httpError(422, 'validation_error', 'A quantidade deve ser um inteiro maior que zero.', {
      quantity: ['Informe uma quantidade inteira maior que zero.'],
    })
  }
  if (edition.available <= 0) {
    throw httpError(409, 'availability_conflict', `A edição "${edition.name}" está esgotada.`)
  }
  const max = Math.min(edition.available, edition.maxPerOrder)
  if (quantity > max) {
    throw httpError(
      409,
      'availability_conflict',
      `Disponibilidade insuficiente: máximo de ${max} unidade(s) desta edição.`,
      {
        quantity: [`Máximo de ${max} unidade(s).`],
      },
    )
  }
  return { nft, edition }
}

export function addItem(
  ownerKey: string,
  nftId: string,
  editionId: string,
  quantity: number,
): CartRecord {
  const cart = getOrCreateCart(ownerKey)
  const existing = cart.items.find((i) => i.nftId === nftId && i.editionId === editionId)
  const nextQuantity = (existing?.quantity ?? 0) + quantity
  const { edition } = assertQuantity(nftId, editionId, nextQuantity)
  if (existing) {
    existing.quantity = nextQuantity
  } else {
    const item: CartItemRecord = {
      id: randomId('ci'),
      nftId,
      editionId,
      quantity,
      addedPriceEth: edition.priceEth,
    }
    cart.items.push(item)
  }
  touch(cart)
  return cart
}

export function updateItem(ownerKey: string, itemId: string, quantity: number): CartRecord {
  const cart = getOrCreateCart(ownerKey)
  const item = cart.items.find((i) => i.id === itemId)
  if (!item) throw httpError(404, 'not_found', 'Item não encontrado no carrinho.')
  assertQuantity(item.nftId, item.editionId, quantity)
  item.quantity = quantity
  touch(cart)
  return cart
}

export function removeItem(ownerKey: string, itemId: string): CartRecord {
  const cart = getOrCreateCart(ownerKey)
  const before = cart.items.length
  cart.items = cart.items.filter((i) => i.id !== itemId)
  if (cart.items.length === before)
    throw httpError(404, 'not_found', 'Item não encontrado no carrinho.')
  if (cart.items.length === 0) cart.couponCode = null
  touch(cart)
  return cart
}

export function setCoupon(ownerKey: string, code: string | null): CartRecord {
  const cart = getOrCreateCart(ownerKey)
  cart.couponCode = code
  touch(cart)
  return cart
}

/** Moves guest items into the user cart (quantities are summed and clamped to the limits). */
export function mergeCarts(guestOwnerKey: string, userOwnerKey: string): CartRecord {
  const db = getDb()
  const guest = db.carts.find((c) => c.ownerKey === guestOwnerKey)
  const user = getOrCreateCart(userOwnerKey)
  if (!guest || guest.items.length === 0) return user

  for (const item of guest.items) {
    const nft = findNft(item.nftId)
    const edition = nft?.editions.find((e) => e.id === item.editionId)
    if (!nft || !edition) continue
    const max = Math.min(edition.available, edition.maxPerOrder)
    const existing = user.items.find(
      (i) => i.nftId === item.nftId && i.editionId === item.editionId,
    )
    if (existing) {
      existing.quantity = Math.max(1, Math.min(max, existing.quantity + item.quantity))
    } else if (max > 0) {
      user.items.push({ ...item, id: randomId('ci'), quantity: Math.min(max, item.quantity) })
    }
  }
  if (!user.couponCode && guest.couponCode) user.couponCode = guest.couponCode
  guest.items = []
  guest.couponCode = null
  touch(guest)
  touch(user)
  return user
}

/** Removes purchased quantities after a confirmed order (keeps the rest). */
export function consumeItems(
  ownerKey: string,
  purchased: Array<{ cartItemId: string; quantity: number }>,
): CartRecord {
  const cart = getOrCreateCart(ownerKey)
  for (const { cartItemId, quantity } of purchased) {
    const item = cart.items.find((i) => i.id === cartItemId)
    if (!item) continue
    item.quantity -= quantity
    if (item.quantity <= 0) cart.items = cart.items.filter((i) => i.id !== cartItemId)
  }
  if (cart.items.length === 0) cart.couponCode = null
  touch(cart)
  return cart
}
