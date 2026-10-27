import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

import { announce } from '@/components/shared/LiveAnnouncer'
import { toast } from '@/hooks/use-toast'
import { queryKeys } from '@/lib/query-keys'
import { ordersApi } from '@/services/api/orders'
import { toApiError } from '@/services/api/errors'
import type { CreateOrderRequest, NetworkId, Order, WalletConnection } from '@/types/api'

/* ----------------------------------------------------------------------------
 * Wallet connection simulation
 * ------------------------------------------------------------------------- */
export type WalletConnectionState =
  | { status: 'idle' }
  | { status: 'connecting' }
  | { status: 'connected'; connection: WalletConnection }
  | { status: 'rejected'; message: string }
  | { status: 'disconnected'; message: string }

export function useWalletConnection() {
  const [state, setState] = useState<WalletConnectionState>({ status: 'idle' })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    setState({ status: 'idle' })
  }, [])

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const connect = useCallback(async (walletId: string, network: NetworkId) => {
    if (timer.current) clearTimeout(timer.current)
    setState({ status: 'connecting' })
    try {
      const connection = await ordersApi.connectWallet({ walletId, network })
      setState({ status: 'connected', connection })
      announce('Carteira conectada.')
      if (connection.sessionTtlMs) {
        timer.current = setTimeout(() => {
          setState({
            status: 'disconnected',
            message: 'A carteira foi desconectada. Conecte novamente para continuar.',
          })
          announce('A carteira foi desconectada.', 'assertive')
        }, connection.sessionTtlMs)
      }
    } catch (error) {
      const apiError = toApiError(error)
      setState({ status: 'rejected', message: apiError.message })
      announce(`Conexão recusada: ${apiError.message}`, 'assertive')
    }
  }, [])

  return { state, connect, reset }
}

/* ----------------------------------------------------------------------------
 * Order creation
 * ------------------------------------------------------------------------- */
export function useCreateOrder(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: { body: CreateOrderRequest; idempotencyKey: string }) =>
      ordersApi.create(body, idempotencyKey),
    onSuccess: (order: Order) => {
      queryClient.setQueryData(queryKeys.orders.detail(userId, order.id), order)
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.list(userId) })
      toast({
        title: 'Pedido enviado',
        description: 'Aguardando confirmação do pagamento simulado.',
        variant: 'info',
      })
      announce('Pedido enviado. Aguardando confirmação.')
    },
  })
}
