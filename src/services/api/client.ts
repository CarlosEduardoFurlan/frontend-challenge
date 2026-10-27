import axios, { type AxiosInstance } from 'axios'

import { env } from '@/lib/env'

/**
 * Single Axios instance used by every REST call in the application.
 * Session interceptors are registered in `src/services/api/interceptors.ts`
 * so this module stays free of feature-specific logic.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})
