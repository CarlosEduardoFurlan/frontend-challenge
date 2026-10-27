import type { MockStatus } from '@/types/api'

import { apiClient } from './client'

/** Client for the MSW-only control endpoints (scenario selection, reset, event triggers). */
export const mockControlApi = {
  async status(): Promise<MockStatus> {
    return (await apiClient.get<MockStatus>('/__mock/status')).data
  },
  async setScenario(id: string): Promise<MockStatus> {
    return (await apiClient.post<MockStatus>('/__mock/scenario', { id })).data
  },
  async reset(): Promise<MockStatus> {
    return (await apiClient.post<MockStatus>('/__mock/reset')).data
  },
  async updatePrice(nftId: string, editionId: string, priceEth: string) {
    return (await apiClient.post(`/__mock/nfts/${nftId}/price`, { editionId, priceEth })).data
  },
  async updateAvailability(nftId: string, editionId: string, available: number) {
    return (await apiClient.post(`/__mock/nfts/${nftId}/availability`, { editionId, available }))
      .data
  },
}
