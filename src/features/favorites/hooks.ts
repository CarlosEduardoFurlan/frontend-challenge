import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'

import { announce } from '@/components/shared/LiveAnnouncer'
import { toast } from '@/hooks/use-toast'
import { favoritesApi } from '@/services/api/favorites'
import { toApiError } from '@/services/api/errors'
import type { FavoritesResponse, NftSummary } from '@/types/api'

import { useSession } from '../auth/hooks'
import { favoritesQuery } from './queries'

export function useFavorites() {
  const { userId } = useSession()
  const query = useQuery({ ...favoritesQuery(userId ?? ''), enabled: Boolean(userId) })
  return {
    ...query,
    ids: query.data?.nftIds ?? [],
    isFavorite: (nftId: string) => query.data?.nftIds.includes(nftId) ?? false,
  }
}

/**
 * Optimistic favourite toggle. The cached list is updated immediately; on failure the previous
 * snapshot is restored and the user is told. Unauthenticated users are sent to login with a
 * redirect back to the current page.
 */
export function useToggleFavorite() {
  const { userId, isAuthenticated } = useSession()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const href = useRouterState({ select: (state) => state.location.href })
  const key = favoritesQuery(userId ?? '').queryKey

  const mutation = useMutation({
    mutationFn: async ({ nftId, next }: { nftId: string; next: boolean; summary?: NftSummary }) =>
      next ? favoritesApi.add(nftId) : favoritesApi.remove(nftId),
    onMutate: async ({ nftId, next, summary }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<FavoritesResponse>(key)
      queryClient.setQueryData<FavoritesResponse>(key, (current) => {
        const base = current ?? { nftIds: [], items: [] }
        if (next) {
          if (base.nftIds.includes(nftId)) return base
          return {
            nftIds: [...base.nftIds, nftId],
            items: summary ? [...base.items, summary] : base.items,
          }
        }
        return {
          nftIds: base.nftIds.filter((id) => id !== nftId),
          items: base.items.filter((item) => item.id !== nftId),
        }
      })
      announce(next ? 'Adicionado aos favoritos.' : 'Removido dos favoritos.')
      return { previous }
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(key, context?.previous)
      toast({
        title: variables.next
          ? 'Não foi possível favoritar'
          : 'Não foi possível remover dos favoritos',
        description: toApiError(error).message,
        variant: 'destructive',
      })
      announce('Falha ao atualizar favoritos. Alteração desfeita.', 'assertive')
    },
    onSuccess: (data) => {
      queryClient.setQueryData(key, data)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key })
    },
  })

  return {
    toggle: (nftId: string, currentlyFavorite: boolean, summary?: NftSummary) => {
      if (!isAuthenticated) {
        void navigate({ to: '/login', search: { redirect: href, reason: 'required' } })
        return
      }
      mutation.mutate({ nftId, next: !currentlyFavorite, summary })
    },
    isPending: mutation.isPending,
    pendingNftId: mutation.isPending ? mutation.variables?.nftId : undefined,
  }
}
