import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/app/styles/globals.css'

import { AppProviders } from '@/app/providers/AppProviders'
import { createAppRouter } from '@/app/router/router'
import { setNetworkReady } from '@/lib/app-ready'
import { enableMocking } from '@/mocks/enable'
import { apiClient } from '@/services/api/client'
import { installSessionInterceptors } from '@/services/api/interceptors'

installSessionInterceptors(apiClient)

// The mock layer starts in the background; the shell renders right away and every network
// call waits for `whenNetworkReady()` (see src/lib/app-ready.ts).
setNetworkReady(enableMocking())

const router = createAppRouter()
const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
)
