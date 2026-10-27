import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { toast } from '@/hooks/use-toast'
import { queryKeys } from '@/lib/query-keys'
import { cartApi } from '@/services/api/cart'

import { sessionEvents } from '../../auth/session-events'
import { getGuestCartId } from '../guest-cart-id'

/**
 * Keeps the guest cart when the visitor authenticates: on `login`, the guest cart is merged
 * into the user cart server-side and the user cart query is refreshed.
 */
export function CartSessionBridge() {
  const queryClient = useQueryClient()

  useEffect(() => {
    return sessionEvents.on((event) => {
      if (event.type !== 'login') return
      const guestCartId = getGuestCartId()
      const userKey = queryKeys.cart(`user:${event.userId}`)
      void cartApi
        .merge(guestCartId)
        .then(async (cart) => {
          // A GET /cart started right after login may still be in flight with the pre-merge
          // (empty) cart: cancel it so it cannot overwrite the merged result.
          await queryClient.cancelQueries({ queryKey: userKey })
          queryClient.setQueryData(userKey, cart)
          queryClient.removeQueries({ queryKey: queryKeys.cart(`guest:${guestCartId}`) })
          if (cart.itemCount > 0) {
            toast({
              title: 'Carrinho recuperado',
              description: `${cart.itemCount} item(ns) mantidos na sua conta.`,
              variant: 'info',
            })
          }
        })
        .catch(() => {
          void queryClient.invalidateQueries({ queryKey: ['cart'] })
        })
    })
  }, [queryClient])

  return null
}
