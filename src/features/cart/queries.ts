import { queryOptions } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-keys'
import { cartApi } from '@/services/api/cart'
import type { NetworkId } from '@/types/api'

export function cartQuery(ownerKey: string) {
  return queryOptions({
    queryKey: queryKeys.cart(ownerKey),
    queryFn: ({ signal }) => cartApi.get(signal),
    staleTime: 15_000,
  })
}

/**
 * Pricing quote. It is a POST (the server may mutate state in some scenarios), but it is
 * modelled as a query because the UI needs it fresh whenever the cart or the network changes.
 */
export function quoteQuery(ownerKey: string, network: NetworkId, cartVersion: number | undefined) {
  return queryOptions({
    queryKey: [...queryKeys.quote(ownerKey, null, network), cartVersion] as const,
    queryFn: ({ signal }) => cartApi.quote(network, signal),
    staleTime: 10_000,
    gcTime: 60_000,
    retry: false,
  })
}
