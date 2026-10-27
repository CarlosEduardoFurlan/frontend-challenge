import { useSyncExternalStore } from 'react'

import { sessionStore } from '../auth/session-store'
import { getGuestCartId } from './guest-cart-id'

/**
 * Cart owner key used in query keys: `user:<id>` when authenticated, `guest:<id>` otherwise.
 * Switching users or logging out changes the key, so caches never mix.
 */
export function getCartOwnerKey(): string {
  const userId = sessionStore.getUserId()
  return userId ? `user:${userId}` : `guest:${getGuestCartId()}`
}

export function useCartOwnerKey(): string {
  return useSyncExternalStore(sessionStore.subscribe, getCartOwnerKey, getCartOwnerKey)
}
