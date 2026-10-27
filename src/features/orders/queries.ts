import { queryOptions } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-keys'
import { ordersApi } from '@/services/api/orders'

export function orderQuery(userId: string, orderId: string) {
  return queryOptions({
    queryKey: queryKeys.orders.detail(userId, orderId),
    queryFn: ({ signal }) => ordersApi.get(orderId, signal),
    // Pending orders are polled as a fallback to the Socket.IO `order.updated` event.
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 3000 : false),
    retry: (failureCount, error) =>
      (error as { status?: number }).status !== 404 && failureCount < 2,
  })
}

export function ordersListQuery(userId: string) {
  return queryOptions({
    queryKey: queryKeys.orders.list(userId),
    queryFn: ({ signal }) => ordersApi.list(signal),
    staleTime: 30_000,
  })
}
