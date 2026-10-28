import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { toast } from '@/hooks/use-toast'
import { queryKeys } from '@/lib/query-keys'

import { sessionEvents } from '../session-events'

/** Routes that require a session; elsewhere an expiry only shows the notice. */
const PRIVATE_PREFIXES = ['/account', '/checkout', '/favorites', '/orders']

/**
 * Reacts to session expiry detected anywhere (Axios 401 or session query): clears private
 * cache and informs the user. On private routes it also redirects to login keeping the current
 * URL so the flow can be resumed after authenticating (e.g. in the middle of the checkout);
 * on public routes the user simply continues browsing as a guest.
 */
export function SessionWatcher() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const href = useRouterState({ select: (state) => state.location.href })
  const hrefRef = useRef(href)
  hrefRef.current = href

  useEffect(() => {
    return sessionEvents.on((event) => {
      if (event.type !== 'expired') return
      queryClient.setQueryData(queryKeys.session, null)
      queryClient.removeQueries({ queryKey: ['private'] })
      toast({
        title: 'Sessão expirada',
        description: 'Entre novamente para continuar de onde parou.',
        variant: 'destructive',
      })
      const current = hrefRef.current
      if (!PRIVATE_PREFIXES.some((prefix) => current.startsWith(prefix))) return
      void navigate({ to: '/login', search: { redirect: current, reason: 'expired' } })
    })
  }, [navigate, queryClient])

  return null
}
