import type { QueryClient } from '@tanstack/react-query'

import { mulEth } from '@/lib/money'
import { formatEth } from '@/lib/money-format'
import { queryKeys } from '@/lib/query-keys'
import type {
  Cart,
  FavoritesResponse,
  Nft,
  NftListResponse,
  NftSummary,
  NftUpdatedEvent,
  Order,
  OrderUpdatedEvent,
} from '@/types/api'

/**
 * Cache reconciliation for realtime events. Each function patches every TanStack Query entry
 * that holds the affected resource, without refetching, and returns what changed so the UI
 * layer can decide how to notify the user.
 */

function patchSummary(summary: NftSummary, event: NftUpdatedEvent): NftSummary {
  if (summary.id !== event.resourceId || summary.version >= event.version) return summary
  return {
    ...summary,
    priceEth: event.payload.priceEth,
    available: event.payload.available,
    version: event.version,
  }
}

export interface NftChangeSummary {
  nftId: string
  name: string | null
  inCart: boolean
  viewingDetail: boolean
  priceChanged: boolean
  availabilityChanged: boolean
  newPrice: string
  soldOut: boolean
}

export function applyNftUpdated(
  queryClient: QueryClient,
  event: NftUpdatedEvent,
): NftChangeSummary {
  const { resourceId: nftId, payload } = event
  let name: string | null = null
  let priceChanged = payload.reason !== 'availability'
  let availabilityChanged = payload.reason !== 'price'

  // Detail
  const detailKey = queryKeys.nfts.detail(nftId)
  const detail = queryClient.getQueryData<Nft>(detailKey)
  if (detail) {
    name = detail.name
    priceChanged =
      detail.priceEth !== payload.priceEth ||
      detail.editions.some(
        (e) => payload.editions.find((p) => p.id === e.id)?.priceEth !== e.priceEth,
      )
    availabilityChanged = detail.available !== payload.available
    if (detail.version < event.version) {
      queryClient.setQueryData<Nft>(detailKey, {
        ...detail,
        priceEth: payload.priceEth,
        available: payload.available,
        version: event.version,
        editions: detail.editions.map((edition) => {
          const patch = payload.editions.find((p) => p.id === edition.id)
          return patch
            ? { ...edition, priceEth: patch.priceEth, available: patch.available }
            : edition
        }),
      })
    }
  }
  const viewingDetail =
    (queryClient.getQueryCache().find({ queryKey: detailKey })?.getObserversCount() ?? 0) > 0
  // A fetch in flight may return data computed before this event: schedule a refetch so the
  // cache ends up consistent with the server after the current request settles.
  if (queryClient.getQueryState(detailKey)?.fetchStatus === 'fetching') {
    void queryClient.invalidateQueries({ queryKey: detailKey })
  }
  if (queryClient.isFetching({ queryKey: queryKeys.nfts.lists }) > 0) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.nfts.lists })
  }

  // Lists (catalog pages, featured, related)
  queryClient.setQueriesData<NftListResponse>({ queryKey: queryKeys.nfts.lists }, (list) =>
    list ? { ...list, items: list.items.map((item) => patchSummary(item, event)) } : list,
  )
  queryClient.setQueryData<NftListResponse>(queryKeys.nfts.featured, (list) =>
    list ? { ...list, items: list.items.map((item) => patchSummary(item, event)) } : list,
  )

  // Favourites
  queryClient.setQueriesData<FavoritesResponse>(
    { queryKey: ['private'], predicate: (q) => q.queryKey[2] === 'favorites' },
    (favorites) =>
      favorites
        ? { ...favorites, items: favorites.items.map((item) => patchSummary(item, event)) }
        : favorites,
  )

  // Carts (guest or user): refresh unit prices/availability and totals; quotes become stale.
  let inCart = false
  queryClient.setQueriesData<Cart>(
    { queryKey: ['cart'], predicate: (q) => q.queryKey.length === 2 },
    (cart) => {
      if (!cart) return cart
      let touched = false
      const items = cart.items.map((item) => {
        if (item.nftId !== nftId || item.nft.version >= event.version) return item
        const edition = payload.editions.find((p) => p.id === item.editionId)
        if (!edition) return item
        touched = true
        inCart = true
        name ??= item.nft.name
        return {
          ...item,
          unitPriceEth: edition.priceEth,
          available: edition.available,
          lineTotalEth: mulEth(edition.priceEth, item.quantity),
          nft: { ...item.nft, version: event.version },
        }
      })
      if (!touched) {
        inCart ||= cart.items.some((item) => item.nftId === nftId)
        return cart
      }
      return {
        ...cart,
        items,
        subtotalEth: items.reduce(
          (sum, i) => (Number(sum) + Number(i.lineTotalEth)).toString(),
          '0',
        ),
        version: cart.version + 1,
      }
    },
  )
  if (inCart) {
    void queryClient.invalidateQueries({
      queryKey: ['cart'],
      predicate: (q) => q.queryKey.includes('quote'),
    })
    // The server-side cart version also changed; refetch to get authoritative totals.
    void queryClient.invalidateQueries({
      queryKey: ['cart'],
      predicate: (q) => q.queryKey.length === 2,
    })
  }

  return {
    nftId,
    name,
    inCart,
    viewingDetail,
    priceChanged,
    availabilityChanged,
    newPrice: formatEth(payload.priceEth),
    soldOut: payload.available <= 0,
  }
}

export function applyOrderUpdated(
  queryClient: QueryClient,
  userId: string,
  event: OrderUpdatedEvent,
): { previousStatus: Order['status'] | null; status: Order['status'] } {
  const key = queryKeys.orders.detail(userId, event.resourceId)
  const current = queryClient.getQueryData<Order>(key)
  const previousStatus = current?.status ?? null

  if (current && current.version < event.version) {
    queryClient.setQueryData<Order>(key, {
      ...current,
      status: event.payload.status,
      txHash: event.payload.txHash,
      explorerUrl: event.payload.explorerUrl,
      rejectionReason: event.payload.rejectionReason,
      updatedAt: event.payload.updatedAt,
      version: event.version,
    })
  } else if (!current) {
    // Not cached (e.g. order list only): fetch on demand when someone observes it.
    void queryClient.invalidateQueries({ queryKey: key })
  }
  void queryClient.invalidateQueries({ queryKey: queryKeys.orders.list(userId) })
  if (event.payload.status === 'confirmed') {
    void queryClient.invalidateQueries({ queryKey: ['cart'] })
    void queryClient.invalidateQueries({ queryKey: ['nfts'] })
  }
  return { previousStatus, status: event.payload.status }
}
