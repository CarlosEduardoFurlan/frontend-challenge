import { useSyncExternalStore } from 'react'

/** Reactive `matchMedia`. Returns `false` during SSR/first paint when `window` is unavailable. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const DESKTOP_QUERY = '(min-width: 1024px)'
