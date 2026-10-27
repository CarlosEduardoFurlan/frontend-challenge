import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-keys'
import { nftsApi } from '@/services/api/nfts'
import type { NftListParams } from '@/types/api'

import type { ResolvedCatalogSearch } from './search-params'

export function toListParams(search: ResolvedCatalogSearch): NftListParams {
  return {
    q: search.q || undefined,
    category: search.category.length ? search.category : undefined,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    available: search.available || undefined,
    sort: search.sort,
    page: search.page,
    pageSize: search.pageSize,
  }
}

/**
 * Catalog list. Each distinct parameter set has its own cache entry, so a late response for
 * an old search never overwrites the current one (out-of-order protection). The previous page
 * is kept on screen while the next one loads to avoid layout jumps; the request for the
 * superseded key is aborted through the query `signal`.
 */
export function nftListQuery(params: NftListParams) {
  return queryOptions({
    queryKey: queryKeys.nfts.list(params),
    queryFn: ({ signal }) => nftsApi.list(params, signal),
    placeholderData: keepPreviousData,
  })
}

export function featuredNftsQuery() {
  return queryOptions({
    queryKey: queryKeys.nfts.featured,
    queryFn: ({ signal }) => nftsApi.list({ featured: true, pageSize: 4, sort: 'popular' }, signal),
    staleTime: 60_000,
  })
}

export function nftDetailQuery(nftId: string) {
  return queryOptions({
    queryKey: queryKeys.nfts.detail(nftId),
    queryFn: ({ signal }) => nftsApi.get(nftId, signal),
    retry: (failureCount, error) => {
      // 404 is final: do not retry a missing NFT.
      const status = (error as { status?: number }).status
      return status !== 404 && failureCount < 2
    },
  })
}
