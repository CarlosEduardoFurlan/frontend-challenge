import type { UpsertWalletRequest, Wallet, WalletKind, WalletsResponse } from '@/types/api'

import { apiClient } from './client'

export const walletsApi = {
  async list(signal?: AbortSignal): Promise<WalletsResponse> {
    return (await apiClient.get<WalletsResponse>('/wallets', { signal })).data
  },
  async upsert(kind: WalletKind, body: UpsertWalletRequest): Promise<Wallet> {
    return (await apiClient.put<Wallet>(`/wallets/${kind}`, body)).data
  },
}
