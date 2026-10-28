import type { AddCartItemRequest, Cart, NetworkId, Quote } from '@/types/api'

import { apiClient } from './client'

export const cartApi = {
  async get(signal?: AbortSignal): Promise<Cart> {
    return (await apiClient.get<Cart>('/cart', { signal })).data
  },
  async addItem(body: AddCartItemRequest): Promise<Cart> {
    return (await apiClient.post<Cart>('/cart/items', body)).data
  },
  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    return (await apiClient.patch<Cart>(`/cart/items/${encodeURIComponent(itemId)}`, { quantity }))
      .data
  },
  async removeItem(itemId: string): Promise<Cart> {
    return (await apiClient.delete<Cart>(`/cart/items/${encodeURIComponent(itemId)}`)).data
  },
  async applyCoupon(code: string): Promise<Cart> {
    return (await apiClient.put<Cart>('/cart/coupon', { code })).data
  },
  async removeCoupon(): Promise<Cart> {
    return (await apiClient.delete<Cart>('/cart/coupon')).data
  },
  async merge(guestCartId: string): Promise<Cart> {
    return (await apiClient.post<Cart>('/cart/merge', { guestCartId })).data
  },
  async quote(network: NetworkId, signal?: AbortSignal): Promise<Quote> {
    return (await apiClient.post<Quote>('/cart/quote', { network }, { signal })).data
  },
}
