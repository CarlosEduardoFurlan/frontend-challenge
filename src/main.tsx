import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/app/styles/globals.css'

import { AppProviders } from '@/app/providers/AppProviders'
import { createAppRouter } from '@/app/router/router'
import { enableMocking } from '@/mocks/enable'
import { apiClient } from '@/services/api/client'
import { installSessionInterceptors } from '@/services/api/interceptors'

async function bootstrap() {
  installSessionInterceptors(apiClient)
  await enableMocking()

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
}

void bootstrap()
