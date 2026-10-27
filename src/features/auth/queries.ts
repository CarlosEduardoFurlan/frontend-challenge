import { queryOptions } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-keys'
import { authApi } from '@/services/api/auth'
import { isApiError } from '@/services/api/errors'
import type { Session } from '@/types/api'

import { sessionStore } from './session-store'

/**
 * Current session. Resolves to `null` when there is no token or the API says the session is
 * gone (401). Any other failure (network, 5xx) is a real error so the UI can show a retry
 * instead of silently logging the user out.
 */
export function sessionQuery() {
  return queryOptions<Session | null>({
    queryKey: queryKeys.session,
    queryFn: async ({ signal }) => {
      if (!sessionStore.getToken()) return null
      try {
        const session = await authApi.session(signal)
        sessionStore.set({ token: session.token, userId: session.user.id })
        return session
      } catch (error) {
        if (isApiError(error) && error.status === 401) {
          sessionStore.clear()
          return null
        }
        throw error
      }
    },
    staleTime: 60_000,
    gcTime: Infinity,
    retry: 1,
  })
}
