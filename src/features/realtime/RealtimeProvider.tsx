import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { announce } from '@/components/shared/LiveAnnouncer'
import { toast } from '@/hooks/use-toast'
import { createSocket, type AppSocket } from '@/services/realtime/socket'
import { queryKeys } from '@/lib/query-keys'
import type { NftUpdatedEvent, Order, OrderUpdatedEvent } from '@/types/api'

import { sessionEvents } from '../auth/session-events'
import { sessionStore } from '../auth/session-store'
import { RealtimeGuard } from './guard'
import { resetRealtimeStatus, setRealtimeStatus } from './status-store'

/**
 * Owns the Socket.IO connection for the current session.
 *
 * Lifecycle: one socket per session. Login, logout and user switch tear the socket down
 * (listeners removed, guard discarded) and open a new one with the new credentials, so events
 * of a previous session can never touch the next user's cache.
 *
 * Reconnection: after a drop the client reconnects automatically; on every reconnection the
 * active resources (catalog, cart, private data) are reconciled with REST because events may
 * have been missed while offline.
 */
export function RealtimeProvider() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let socket: AppSocket | null = null
    let guard = new RealtimeGuard()
    let everConnected = false
    // Stock changes caused by the user's own confirmed order are not worth a notification.
    let muteNftToastsUntil = 0

    let generation = 0

    const open = async () => {
      close()
      const current = ++generation
      guard = new RealtimeGuard()
      everConnected = false
      resetRealtimeStatus()
      const userId = sessionStore.getUserId()
      const next = await createSocket(sessionStore.getToken())
      if (current !== generation) {
        // A newer session started while the client module was loading.
        next.disconnect()
        return
      }
      socket = next

      next.on('connect', () => {
        // Warm the reconciliation module so the first event is applied without an extra delay.
        void import('./apply-events')
        const reconnected = everConnected
        everConnected = true
        setRealtimeStatus({ state: 'connected', connections: next.io.engine ? 1 : 1 })
        if (reconnected) {
          // Reconcile everything that might have changed while disconnected.
          void queryClient.invalidateQueries({ queryKey: ['nfts'], refetchType: 'active' })
          void queryClient.invalidateQueries({ queryKey: ['cart'], refetchType: 'active' })
          void queryClient.invalidateQueries({ queryKey: ['private'], refetchType: 'active' })
          announce('Conexão em tempo real restabelecida. Dados atualizados.')
        }
      })

      next.on('disconnect', () => {
        setRealtimeStatus({ state: 'disconnected' })
      })

      next.io.on('reconnect_attempt', () => {
        setRealtimeStatus({ state: 'connecting' })
      })

      next.on('nft.updated', async (event: NftUpdatedEvent) => {
        if (!guard.accept(event)) return
        setRealtimeStatus({ lastEventAt: event.emittedAt })
        // Cache reconciliation (decimal.js) is loaded on first use, not in the initial bundle.
        const { applyNftUpdated } = await import('./apply-events')
        const change = applyNftUpdated(queryClient, event)
        if ((change.inCart || change.viewingDetail) && Date.now() > muteNftToastsUntil) {
          const label = change.name ?? 'Um NFT'
          const message = change.soldOut
            ? `${label} ficou esgotado.`
            : change.priceChanged
              ? `${label} agora custa ${change.newPrice}.`
              : `${label} teve a disponibilidade atualizada.`
          toast({
            title: change.inCart ? 'Item do carrinho atualizado' : 'NFT atualizado',
            description: message,
            variant: change.soldOut ? 'destructive' : 'info',
          })
          announce(message, 'polite')
        }
      })

      next.on('order.updated', async (event: OrderUpdatedEvent) => {
        // Defensive: the server scopes delivery, but the handler also checks the session owner.
        if (!userId || sessionStore.getUserId() !== userId) return
        if (!guard.accept(event)) return
        setRealtimeStatus({ lastEventAt: event.emittedAt })
        // Snapshot the status before the (lazy) reconciliation module loads: the polling
        // fallback may update the cache meanwhile and the transition would be missed.
        const previousStatus =
          queryClient.getQueryData<Order>(queryKeys.orders.detail(userId, event.resourceId))
            ?.status ?? null
        const { applyOrderUpdated } = await import('./apply-events')
        const { status } = applyOrderUpdated(queryClient, userId, event)
        if (previousStatus !== status && status !== 'pending') {
          const confirmed = status === 'confirmed'
          if (confirmed) muteNftToastsUntil = Date.now() + 3000
          toast({
            title: confirmed ? 'Pagamento confirmado' : 'Pagamento recusado',
            description: confirmed
              ? 'Seu pedido foi confirmado.'
              : (event.payload.rejectionReason ?? 'O pedido foi recusado.'),
            variant: confirmed ? 'success' : 'destructive',
          })
          announce(confirmed ? 'Pagamento confirmado.' : 'Pagamento recusado.', 'assertive')
        }
      })
    }

    const close = () => {
      if (!socket) return
      socket.removeAllListeners()
      socket.io.removeAllListeners()
      socket.disconnect()
      socket = null
    }

    void open()
    const unsubscribe = sessionEvents.on((event) => {
      if (event.type === 'login' || event.type === 'logout' || event.type === 'expired') void open()
    })

    return () => {
      generation += 1
      unsubscribe()
      close()
    }
  }, [queryClient])

  return null
}
