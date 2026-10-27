import type {
  CreateOrderRequest,
  Order,
  OrderListResponse,
  WalletConnectRequest,
  WalletConnection,
} from '@/types/api'

import { apiClient } from './client'

export const ordersApi = {
  /** `idempotencyKey` must be reused on retries so a timeout never creates a second order. */
  async create(body: CreateOrderRequest, idempotencyKey: string): Promise<Order> {
    return (
      await apiClient.post<Order>('/orders', body, {
        headers: { 'Idempotency-Key': idempotencyKey },
      })
    ).data
  },
  async get(orderId: string, signal?: AbortSignal): Promise<Order> {
    return (await apiClient.get<Order>(`/orders/${encodeURIComponent(orderId)}`, { signal })).data
  },
  async list(signal?: AbortSignal): Promise<OrderListResponse> {
    return (await apiClient.get<OrderListResponse>('/orders', { signal })).data
  },
  async connectWallet(body: WalletConnectRequest): Promise<WalletConnection> {
    return (await apiClient.post<WalletConnection>('/wallets/connect', body)).data
  },
}
