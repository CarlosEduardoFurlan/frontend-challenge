import { createRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'
import { parseSearch, stringifySearch } from './search'

export function createAppRouter() {
  return createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    parseSearch,
    stringifySearch,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
