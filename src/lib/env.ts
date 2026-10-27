/**
 * Typed access to Vite environment variables.
 * Every variable has a safe default so the demo build runs from a clean checkout.
 */
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? '/api',
  socketUrl: import.meta.env.VITE_SOCKET_URL ?? '/',
  mocksEnabled: (import.meta.env.VITE_ENABLE_MOCKS ?? 'true') !== 'false',
  defaultScenario: import.meta.env.VITE_MOCK_SCENARIO ?? 'default',
  isDev: import.meta.env.DEV,
  isTest: import.meta.env.MODE === 'test',
} as const
