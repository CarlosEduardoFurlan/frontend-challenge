import axios, { type AxiosInstance } from 'axios'

import { env } from '@/lib/env'

import { toApiError } from './errors'

/**
 * Single Axios instance used by every REST call in the application.
 * - Every failure is normalised to `ApiError` so queries, mutations and components deal with
 *   one shape (status, code, field details, network flag).
 * - Session headers and 401 handling are registered by `installSessionInterceptors` in the
 *   auth feature, keeping this module free of feature-specific logic.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)
