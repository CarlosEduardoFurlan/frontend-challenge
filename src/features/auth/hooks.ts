import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'

import { toast } from '@/hooks/use-toast'
import { queryKeys } from '@/lib/query-keys'
import { authApi } from '@/services/api/auth'
import type { LoginRequest, RegisterRequest, Session } from '@/types/api'

import { rotateGuestCartId } from '../cart/guest-cart-id'
import { sessionQuery } from './queries'
import { sessionEvents } from './session-events'
import { sessionStore, useStoredSession } from './session-store'

export function useSession() {
  const stored = useStoredSession()
  const query = useQuery({ ...sessionQuery(), enabled: true })
  const user = stored ? (query.data?.user ?? null) : null
  return {
    user,
    userId: stored?.userId ?? null,
    token: stored?.token ?? null,
    isAuthenticated: Boolean(stored),
    isLoading: Boolean(stored) && query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/** Shared post-login bookkeeping: store token, prime the session cache, notify features. */
function useApplySession() {
  const queryClient = useQueryClient()
  return useCallback(
    (session: Session) => {
      const previousUserId = sessionStore.getUserId()
      if (previousUserId && previousUserId !== session.user.id) {
        // Switching users: drop every private entry of the previous account.
        queryClient.removeQueries({ queryKey: queryKeys.private(previousUserId) })
      }
      sessionStore.set({ token: session.token, userId: session.user.id })
      queryClient.setQueryData(queryKeys.session, session)
      sessionEvents.emit({ type: 'login', userId: session.user.id })
    },
    [queryClient],
  )
}

export function useLogin() {
  const applySession = useApplySession()
  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: applySession,
  })
}

export function useRegister() {
  const applySession = useApplySession()
  return useMutation({
    mutationFn: (body: RegisterRequest) => authApi.register(body),
    onSuccess: applySession,
  })
}

/**
 * Logout is optimistic: the local session, private cache entries and the guest identity are
 * wiped immediately, so nothing from the previous user can leak even if the network is slow.
 * The server call then invalidates the token best-effort.
 */
export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      const session = sessionStore.get()
      sessionStore.clear()
      queryClient.setQueryData(queryKeys.session, null)
      queryClient.removeQueries({ queryKey: ['private'] })
      queryClient.removeQueries({ queryKey: ['cart'] })
      rotateGuestCartId()
      sessionEvents.emit({ type: 'logout', userId: session?.userId ?? null })
      toast({ title: 'Você saiu da conta.', variant: 'info' })
      void navigate({ to: '/' })
      if (session?.token) {
        try {
          await authApi.logout(session.token)
        } catch {
          // Local state is already clean; a failed revocation only affects the mock session list.
        }
      }
    },
  })
}
