import { QueryClient } from '@tanstack/react-query'

import { isTransientError } from '@/services/api/errors'

/**
 * Cache policy (documented in ARCHITECTURE.md):
 * - staleTime 30s: lists and details are considered fresh for half a minute, then refetched in
 *   the background on mount/focus. Socket.IO events invalidate earlier when needed.
 * - gcTime 5min: unused data is dropped after five minutes.
 * - retry: only transient failures (network, 5xx, 429) are retried, at most twice, with
 *   exponential backoff. 4xx errors fail immediately because retrying cannot fix them.
 * - Mutations are never retried automatically: order creation relies on idempotency keys
 *   and the user explicitly retries from the UI.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: (failureCount, error) => failureCount < 2 && isTransientError(error),
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
        throwOnError: false,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}
