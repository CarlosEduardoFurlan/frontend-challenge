import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { toast } from '@/hooks/use-toast'
import { queryKeys } from '@/lib/query-keys'

import { sessionEvents } from '../session-events'

const PUBLIC_PREFIXES = ['/login', '/register']

/**
 * Reacts to session expiry detected anywhere (Axios 401 or session query): clears private
 * cache, informs the user and redirects to login keeping the current URL so the flow can be
 * resumed after authenticating (e.g. in the middle of the checkout).
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
      if (PUBLIC_PREFIXES.some((prefix) => current.startsWith(prefix))) return
      void navigate({ to: '/login', search: { redirect: current, reason: 'expired' } })
    })
  }, [navigate, queryClient])

  return null
}
