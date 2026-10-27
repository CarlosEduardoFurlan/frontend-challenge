import { redirect, type ParsedLocation } from '@tanstack/react-router'

import { sessionStore } from './session-store'

/**
 * Route guard for private screens. Runs in `beforeLoad`, before any component renders, so a
 * direct access to `/checkout` or `/account/profile` without a token lands on the login page
 * with a `redirect` back to the requested URL.
 */
export function requireAuth({ location }: { location: ParsedLocation }): void {
  if (!sessionStore.getToken()) {
    throw redirect({ to: '/login', search: { redirect: location.href } })
  }
}

/** Safe redirect target: only same-origin paths are honoured. */
export function sanitizeRedirect(target: string | undefined, fallback = '/'): string {
  if (!target || !target.startsWith('/') || target.startsWith('//')) return fallback
  if (target.startsWith('/login') || target.startsWith('/register')) return fallback
  return target
}
