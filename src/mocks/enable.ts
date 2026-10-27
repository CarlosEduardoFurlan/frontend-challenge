import { env } from '@/lib/env'

/**
 * Starts the MSW worker when mocks are enabled. The service worker is registered from
 * `public/mockServiceWorker.js`, which is also shipped in the demo build.
 *
 * Boot order matters: scenario selection (URL/localStorage) and the persisted database are
 * resolved before the first request so direct access and refresh are deterministic.
 */
export async function enableMocking(): Promise<void> {
  if (!env.mocksEnabled) return

  const [
    { worker },
    { initScenarioFromLocation },
    { loadDb, resetDb },
    { installMockControl },
    { resumePendingOrders },
  ] = await Promise.all([
    import('./browser'),
    import('./lib/scenario-state'),
    import('./persistence/db'),
    import('./control'),
    import('./lib/order-store'),
  ])

  const { reset } = initScenarioFromLocation()
  if (reset) await resetDb()
  else await loadDb()

  installMockControl()
  // Pending orders keep settling after a refresh (simulated payment runs server-side).
  resumePendingOrders()

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
    quiet: !env.isDev,
  })
}
