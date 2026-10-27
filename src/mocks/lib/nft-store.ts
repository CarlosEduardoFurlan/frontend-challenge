import { CATEGORY_LABELS, NFT_CATEGORIES } from '@/features/catalog/search-params'
import { compareEth, type DecimalString } from '@/lib/money'
import { NETWORK_LIST } from '@/mocks/fixtures/networks'
import type { Nft, NftListParams, NftListResponse, NftSummary, NftUpdatedEvent } from '@/types/api'

import { mockEventBus } from './event-bus'
import { getDb, nextEventId, persist } from '../persistence/db'

/* ----------------------------------------------------------------------------
 * Read helpers
 * ------------------------------------------------------------------------- */
export function toSummary(nft: Nft): NftSummary {
  return {
    id: nft.id,
    name: nft.name,
    collection: nft.collection,
    collectionId: nft.collectionId,
    category: nft.category,
    imageUrl: nft.imageUrl,
    priceEth: nft.priceEth,
    available: nft.available,
    featured: nft.featured,
    likes: nft.likes,
    createdAt: nft.createdAt,
    version: nft.version,
  }
}

export function findNft(id: string): Nft | undefined {
  return getDb().nfts.find((n) => n.id === id)
}

function normalise(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function queryNfts(params: NftListParams, options?: { empty?: boolean }): NftListResponse {
  const all = options?.empty ? [] : getDb().nfts
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(48, Math.max(1, params.pageSize ?? 9))

  let items = all
  if (params.ids?.length) {
    const set = new Set(params.ids)
    items = items.filter((n) => set.has(n.id))
  }
  if (params.featured) items = items.filter((n) => n.featured)
  if (params.q) {
    const q = normalise(params.q)
    items = items.filter(
      (n) =>
        normalise(n.name).includes(q) ||
        normalise(n.collection).includes(q) ||
        normalise(n.creator.name).includes(q),
    )
  }
  if (params.category?.length) {
    const set = new Set(params.category)
    items = items.filter((n) => set.has(n.category))
  }
  if (params.network?.length) {
    const set = new Set(params.network)
    items = items.filter((n) => set.has(n.network))
  }
  if (params.minPrice) items = items.filter((n) => compareEth(n.priceEth, params.minPrice!) >= 0)
  if (params.maxPrice) items = items.filter((n) => compareEth(n.priceEth, params.maxPrice!) <= 0)
  if (params.available) items = items.filter((n) => n.available > 0)

  const sorted = [...items]
  switch (params.sort) {
    case 'price_asc':
      sorted.sort((a, b) => compareEth(a.priceEth, b.priceEth) || a.id.localeCompare(b.id))
      break
    case 'price_desc':
      sorted.sort((a, b) => compareEth(b.priceEth, a.priceEth) || a.id.localeCompare(b.id))
      break
    case 'newest':
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      break
    case 'popular':
      sorted.sort((a, b) => b.likes - a.likes || a.id.localeCompare(b.id))
      break
    case 'relevance':
    default:
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || a.id.localeCompare(b.id))
  }

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize
  const pageItems = sorted.slice(start, start + pageSize).map(toSummary)

  const facetSource = all.filter((n) =>
    params.q
      ? normalise(n.name).includes(normalise(params.q)) ||
        normalise(n.collection).includes(normalise(params.q))
      : true,
  )
  const categories = NFT_CATEGORIES.map((id) => ({
    id,
    label: CATEGORY_LABELS[id],
    count: facetSource.filter((n) => n.category === id).length,
  }))
  const networks = NETWORK_LIST.map((network) => ({
    id: network.id,
    label: network.label,
    count: facetSource.filter((n) => n.network === network.id).length,
  }))
  const prices = all.map((n) => n.priceEth)
  const priceRange = prices.length
    ? {
        min: prices.reduce((m, p) => (compareEth(p, m) < 0 ? p : m)),
        max: prices.reduce((m, p) => (compareEth(p, m) > 0 ? p : m)),
      }
    : { min: '0', max: '0' }

  return {
    items: pageItems,
    page,
    pageSize,
    total,
    totalPages,
    facets: { categories, networks, priceRange },
  }
}

/* ----------------------------------------------------------------------------
 * Mutations (every change bumps the version and publishes `nft.updated`)
 * ------------------------------------------------------------------------- */
function recomputeAggregates(nft: Nft) {
  nft.available = nft.editions.reduce((sum, e) => sum + e.available, 0)
  nft.priceEth = nft.editions.reduce<DecimalString>(
    (min, e) => (compareEth(e.priceEth, min) < 0 ? e.priceEth : min),
    nft.editions[0]?.priceEth ?? '0',
  )
}

function publishNftUpdated(nft: Nft, reason: NftUpdatedEvent['payload']['reason']) {
  const event: NftUpdatedEvent = {
    eventId: nextEventId(),
    type: 'nft.updated',
    resourceId: nft.id,
    version: nft.version,
    emittedAt: new Date().toISOString(),
    payload: {
      priceEth: nft.priceEth,
      available: nft.available,
      editions: nft.editions.map((e) => ({
        id: e.id,
        priceEth: e.priceEth,
        available: e.available,
      })),
      reason,
    },
  }
  mockEventBus.emit('nft.updated', event)
  return event
}

export function updateEditionPrice(nftId: string, editionId: string, priceEth: DecimalString) {
  const nft = findNft(nftId)
  const edition = nft?.editions.find((e) => e.id === editionId)
  if (!nft || !edition) return null
  edition.priceEth = priceEth
  recomputeAggregates(nft)
  nft.version += 1
  persist()
  return publishNftUpdated(nft, 'price')
}

export function updateEditionAvailability(nftId: string, editionId: string, available: number) {
  const nft = findNft(nftId)
  const edition = nft?.editions.find((e) => e.id === editionId)
  if (!nft || !edition) return null
  edition.available = Math.max(0, Math.trunc(available))
  recomputeAggregates(nft)
  nft.version += 1
  persist()
  return publishNftUpdated(nft, 'availability')
}

/** Decrements stock after a confirmed purchase. */
export function consumeStock(nftId: string, editionId: string, quantity: number) {
  const nft = findNft(nftId)
  const edition = nft?.editions.find((e) => e.id === editionId)
  if (!nft || !edition) return null
  edition.available = Math.max(0, edition.available - quantity)
  recomputeAggregates(nft)
  nft.version += 1
  persist()
  return publishNftUpdated(nft, 'availability')
}

/**
 * Re-emits an nft.updated event for tests/demos. `overrides` can forge an old version or a stale
 * payload to verify that the client ignores duplicated and out-of-order events.
 */
export function replayNftEvent(
  nftId: string,
  overrides?: Partial<Pick<NftUpdatedEvent, 'eventId' | 'version'>> & {
    payload?: Partial<NftUpdatedEvent['payload']>
  },
) {
  const nft = findNft(nftId)
  if (!nft) return null
  const event: NftUpdatedEvent = {
    eventId: overrides?.eventId ?? nextEventId(),
    type: 'nft.updated',
    resourceId: nft.id,
    version: overrides?.version ?? nft.version,
    emittedAt: new Date().toISOString(),
    payload: {
      priceEth: nft.priceEth,
      available: nft.available,
      editions: nft.editions.map((e) => ({
        id: e.id,
        priceEth: e.priceEth,
        available: e.available,
      })),
      reason: 'both',
      ...overrides?.payload,
    },
  }
  mockEventBus.emit('nft.updated', event)
  return event
}
