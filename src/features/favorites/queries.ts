import { queryOptions } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-keys'
import { favoritesApi } from '@/services/api/favorites'

/** Favourites of a user. Keyed under `['private', userId]` so logout can drop it. */
export function favoritesQuery(userId: string) {
  return queryOptions({
    queryKey: queryKeys.favorites(userId),
    queryFn: ({ signal }) => favoritesApi.list(signal),
    staleTime: 60_000,
  })
}
