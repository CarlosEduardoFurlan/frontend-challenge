import type { NftListParams } from '@/types/api'

/**
 * Query key factory. Private data is namespaced by user id so a logout or user switch can
 * drop every key of the previous session (`removeQueries({ queryKey: ['private', oldId] })`)
 * and two users never share cached entries.
 */
export const queryKeys = {
  mock: {
    status: ['mock', 'status'] as const,
  },
  session: ['session'] as const,
  nfts: {
    all: ['nfts'] as const,
    lists: ['nfts', 'list'] as const,
    list: (params: NftListParams) => ['nfts', 'list', params] as const,
    featured: ['nfts', 'featured'] as const,
    details: ['nfts', 'detail'] as const,
    detail: (id: string) => ['nfts', 'detail', id] as const,
  },
  private: (userId: string) => ['private', userId] as const,
  favorites: (userId: string) => ['private', userId, 'favorites'] as const,
  cart: (ownerKey: string) => ['cart', ownerKey] as const,
  quote: (ownerKey: string, couponCode: string | null, network: string) =>
    ['cart', ownerKey, 'quote', couponCode, network] as const,
  orders: {
    list: (userId: string) => ['private', userId, 'orders'] as const,
    detail: (userId: string, orderId: string) => ['private', userId, 'orders', orderId] as const,
  },
  profile: (userId: string) => ['private', userId, 'profile'] as const,
  wallets: (userId: string) => ['private', userId, 'wallets'] as const,
}
