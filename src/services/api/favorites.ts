import type { FavoritesResponse } from '@/types/api'

import { apiClient } from './client'

export const favoritesApi = {
  async list(signal?: AbortSignal): Promise<FavoritesResponse> {
    return (await apiClient.get<FavoritesResponse>('/favorites', { signal })).data
  },
  async add(nftId: string): Promise<FavoritesResponse> {
    return (await apiClient.post<FavoritesResponse>(`/favorites/${encodeURIComponent(nftId)}`)).data
  },
  async remove(nftId: string): Promise<FavoritesResponse> {
    return (await apiClient.delete<FavoritesResponse>(`/favorites/${encodeURIComponent(nftId)}`))
      .data
  },
}
