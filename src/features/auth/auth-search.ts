/**
 * Search params of the login/register routes, parsed without Zod to keep the initial bundle
 * small (see features/catalog/search-params.ts).
 */
export interface AuthSearch {
  redirect?: string
  reason?: 'expired' | 'required'
}

export function parseAuthSearch(input: unknown): AuthSearch {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const result: AuthSearch = {}
  if (typeof raw.redirect === 'string' && raw.redirect) result.redirect = raw.redirect
  if (raw.reason === 'expired' || raw.reason === 'required') result.reason = raw.reason
  return result
}
