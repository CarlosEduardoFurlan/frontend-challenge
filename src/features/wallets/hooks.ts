import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { announce } from '@/components/shared/LiveAnnouncer'
import { toast } from '@/hooks/use-toast'
import { queryKeys } from '@/lib/query-keys'
import { walletsApi } from '@/services/api/wallets'
import type { UpsertWalletRequest, WalletKind, WalletsResponse } from '@/types/api'

import { useSession } from '../auth/hooks'

export function walletsQuery(userId: string) {
  return queryOptions({
    queryKey: queryKeys.wallets(userId),
    queryFn: ({ signal }) => walletsApi.list(signal),
    staleTime: 60_000,
  })
}

export function useWallets() {
  const { userId } = useSession()
  return useQuery({ ...walletsQuery(userId ?? ''), enabled: Boolean(userId) })
}

export function useUpsertWallet() {
  const { userId } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ kind, body }: { kind: WalletKind; body: UpsertWalletRequest }) =>
      walletsApi.upsert(kind, body),
    onSuccess: (wallet, { kind }) => {
      if (userId) {
        queryClient.setQueryData<WalletsResponse>(queryKeys.wallets(userId), (current) => ({
          primary: current?.primary ?? null,
          secondary: current?.secondary ?? null,
          [kind]: wallet,
        }))
      }
      toast({
        title: `Carteira ${kind === 'primary' ? 'principal' : 'secundária'} salva`,
        variant: 'success',
      })
      announce('Carteira salva com sucesso.')
    },
    onSettled: () => {
      if (userId) void queryClient.invalidateQueries({ queryKey: queryKeys.wallets(userId) })
    },
  })
}
