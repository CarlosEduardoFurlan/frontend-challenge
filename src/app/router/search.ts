/**
 * Human-readable search param (de)serialisation for TanStack Router.
 *
 * The router default encodes non-string values as JSON (`category=["games"]`, `page=2` becomes
 * `page=2` but `minPrice="1"`). The catalog URL is part of the product (shareable, bookmarkable),
 * so we use plain `URLSearchParams` semantics instead: arrays become repeated keys and every
 * value is a string. Route schemas coerce the strings back (see `catalogSearchSchema`).
 */
export function parseSearch(searchStr: string): Record<string, unknown> {
  const params = new URLSearchParams(searchStr.startsWith('?') ? searchStr.slice(1) : searchStr)
  const result: Record<string, unknown> = {}
  for (const [key, value] of params) {
    if (key in result) {
      const previous = result[key]
      result[key] = Array.isArray(previous) ? [...previous, value] : [previous, value]
    } else {
      result[key] = value
    }
  }
  return result
}

export function stringifySearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null || value === '' || value === false) continue
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)))
    } else {
      params.set(key, String(value))
    }
  }
  const serialised = params.toString()
  return serialised ? `?${serialised}` : ''
}
