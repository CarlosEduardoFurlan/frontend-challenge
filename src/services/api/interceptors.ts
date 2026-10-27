import type { AxiosInstance } from 'axios'

import { sessionEvents } from '@/features/auth/session-events'
import { sessionStore } from '@/features/auth/session-store'
import { getGuestCartId } from '@/features/cart/guest-cart-id'

import { isApiError } from './errors'

/**
 * Session interceptors:
 * - request: attaches the bearer token and the guest cart id.
 * - response: a 401 with `session_expired`/`unauthorized` clears the local session and emits
 *   `expired`, so the app can redirect to login while preserving the current context.
 *   Login failures (`invalid_credentials`) are not treated as an expired session.
 */
export function installSessionInterceptors(client: AxiosInstance): void {
  client.interceptors.request.use((config) => {
    const token = sessionStore.getToken()
    if (token) config.headers.set('Authorization', `Bearer ${token}`)
    config.headers.set('X-Guest-Cart-Id', getGuestCartId())
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (
        isApiError(error) &&
        error.status === 401 &&
        error.code !== 'invalid_credentials' &&
        sessionStore.getToken()
      ) {
        sessionStore.clear()
        sessionEvents.emit({ type: 'expired' })
      }
      return Promise.reject(error)
    },
  )
}
