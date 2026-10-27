import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { announce } from '@/components/shared/LiveAnnouncer'
import { toast } from '@/hooks/use-toast'
import { queryKeys } from '@/lib/query-keys'
import { profileApi } from '@/services/api/profile'
import type { ChangePasswordRequest, Session, UpdateProfileRequest } from '@/types/api'

import { useSession } from '../auth/hooks'

export function profileQuery(userId: string) {
  return queryOptions({
    queryKey: queryKeys.profile(userId),
    queryFn: ({ signal }) => profileApi.get(signal),
    staleTime: 60_000,
  })
}

export function useProfile() {
  const { userId } = useSession()
  return useQuery({ ...profileQuery(userId ?? ''), enabled: Boolean(userId) })
}

/** Updates the profile and keeps the session cache (header avatar/name) in sync. */
export function useUpdateProfile() {
  const { userId } = useSession()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => profileApi.update(body),
    onSuccess: (user) => {
      if (userId) queryClient.setQueryData(queryKeys.profile(userId), user)
      queryClient.setQueryData<Session | null>(queryKeys.session, (session) =>
        session ? { ...session, user } : session,
      )
      toast({ title: 'Perfil atualizado', variant: 'success' })
      announce('Perfil atualizado com sucesso.')
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordRequest) => profileApi.changePassword(body),
    onSuccess: () => {
      toast({
        title: 'Senha alterada',
        description: 'Use a nova senha no próximo login.',
        variant: 'success',
      })
      announce('Senha alterada com sucesso.')
    },
  })
}
