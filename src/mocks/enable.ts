import { env } from '@/lib/env'

/**
 * Starts the MSW worker when mocks are enabled. The service worker is registered from
 * `public/mockServiceWorker.js`, which is also shipped in the demo build.
 */
export async function enableMocking(): Promise<void> {
  if (!env.mocksEnabled) return

  const { worker } = await import('./browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
    quiet: !env.isDev,
  })
}
