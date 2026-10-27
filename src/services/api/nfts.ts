import type { Nft, NftListParams, NftListResponse } from '@/types/api'

import { apiClient } from './client'

/** Builds the query string the API expects (arrays as repeated keys). */
export function buildNftListQuery(params: NftListParams): URLSearchParams {
  const query = new URLSearchParams()
  if (params.q) query.set('q', params.q)
  params.category?.forEach((c) => query.append('category', c))
  if (params.minPrice) query.set('minPrice', params.minPrice)
  if (params.maxPrice) query.set('maxPrice', params.maxPrice)
  if (params.available) query.set('available', 'true')
  if (params.sort) query.set('sort', params.sort)
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  if (params.featured) query.set('featured', 'true')
  params.ids?.forEach((id) => query.append('ids', id))
  return query
}

export const nftsApi = {
  async list(params: NftListParams, signal?: AbortSignal): Promise<NftListResponse> {
    const { data } = await apiClient.get<NftListResponse>('/nfts', {
      params: buildNftListQuery(params),
      signal,
    })
    return data
  },

  async get(nftId: string, signal?: AbortSignal): Promise<Nft> {
    const { data } = await apiClient.get<Nft>(`/nfts/${encodeURIComponent(nftId)}`, { signal })
    return data
  },
}
