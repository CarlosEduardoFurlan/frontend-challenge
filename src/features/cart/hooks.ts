import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { announce } from '@/components/shared/LiveAnnouncer'
import { toast } from '@/hooks/use-toast'
import { queryKeys } from '@/lib/query-keys'
import { cartApi } from '@/services/api/cart'
import { toApiError } from '@/services/api/errors'
import type { AddCartItemRequest, Cart, NetworkId } from '@/types/api'

import { useCartOwnerKey } from './owner'
import { cartQuery, quoteQuery } from './queries'

export function useCart() {
  const ownerKey = useCartOwnerKey()
  const query = useQuery(cartQuery(ownerKey))
  return { ...query, ownerKey, itemCount: query.data?.itemCount ?? 0 }
}

/** Shared bookkeeping for every cart mutation: cache the returned cart and refresh quotes. */
function useCartMutationEffects() {
  const ownerKey = useCartOwnerKey()
  const queryClient = useQueryClient()
  return {
    ownerKey,
    onSuccess: (cart: Cart) => {
      queryClient.setQueryData(queryKeys.cart(ownerKey), cart)
      void queryClient.invalidateQueries({ queryKey: [...queryKeys.cart(ownerKey), 'quote'] })
    },
    onError: (error: unknown, fallbackTitle: string) => {
      const apiError = toApiError(error)
      toast({ title: fallbackTitle, description: apiError.message, variant: 'destructive' })
      announce(`${fallbackTitle}. ${apiError.message}`, 'assertive')
      // Availability may have changed: refresh the cart so limits are current.
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart(ownerKey) })
    },
  }
}

export function useAddToCart() {
  const effects = useCartMutationEffects()
  return useMutation({
    mutationFn: (body: AddCartItemRequest) => cartApi.addItem(body),
    onSuccess: (cart, variables) => {
      effects.onSuccess(cart)
      const item = cart.items.find(
        (i) => i.nftId === variables.nftId && i.editionId === variables.editionId,
      )
      toast({
        title: 'Adicionado ao carrinho',
        description: item
          ? `${item.nft.name} · ${item.edition.name} (${item.quantity}×)`
          : undefined,
        variant: 'success',
      })
      announce('Item adicionado ao carrinho.')
    },
    onError: (error) => effects.onError(error, 'Não foi possível adicionar ao carrinho'),
  })
}

export function useUpdateCartItem() {
  const effects = useCartMutationEffects()
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, quantity),
    onSuccess: (cart) => {
      effects.onSuccess(cart)
      announce('Quantidade atualizada.')
    },
    onError: (error) => effects.onError(error, 'Não foi possível alterar a quantidade'),
  })
}

export function useRemoveCartItem() {
  const effects = useCartMutationEffects()
  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: (cart) => {
      effects.onSuccess(cart)
      announce('Item removido do carrinho.')
    },
    onError: (error) => effects.onError(error, 'Não foi possível remover o item'),
  })
}

export function useApplyCoupon() {
  const effects = useCartMutationEffects()
  return useMutation({
    mutationFn: (code: string) => cartApi.applyCoupon(code),
    onSuccess: (cart) => {
      effects.onSuccess(cart)
      toast({
        title: 'Cupom aplicado',
        description: cart.couponCode ?? undefined,
        variant: 'success',
      })
      announce('Cupom aplicado.')
    },
  })
}

export function useRemoveCoupon() {
  const effects = useCartMutationEffects()
  return useMutation({
    mutationFn: () => cartApi.removeCoupon(),
    onSuccess: (cart) => {
      effects.onSuccess(cart)
      announce('Cupom removido.')
    },
    onError: (error) => effects.onError(error, 'Não foi possível remover o cupom'),
  })
}

export function useQuote(network: NetworkId, options?: { enabled?: boolean }) {
  const cart = useCart()
  const query = useQuery({
    ...quoteQuery(cart.ownerKey, network, cart.data?.version),
    enabled: (options?.enabled ?? true) && Boolean(cart.data) && (cart.data?.items.length ?? 0) > 0,
  })
  return { ...query, cart }
}

/** "Buy now": adds the item and goes straight to the checkout. */
export function useBuyNow() {
  const add = useAddToCart()
  const navigate = useNavigate()
  return {
    ...add,
    buyNow: async (body: AddCartItemRequest) => {
      await add.mutateAsync(body)
      await navigate({ to: '/checkout' })
    },
  }
}
