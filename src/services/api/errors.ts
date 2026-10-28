import { AxiosError, isAxiosError } from 'axios'

/** Error envelope returned by the (mocked) API for every non-2xx response. */
export interface ApiErrorBody {
  code: string
  message: string
  details?: Record<string, string[]>
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details: Record<string, string[]> | undefined
  readonly isNetworkError: boolean

  constructor(params: {
    status: number
    code: string
    message: string
    details?: Record<string, string[]>
    isNetworkError?: boolean
  }) {
    super(params.message)
    this.name = 'ApiError'
    this.status = params.status
    this.code = params.code
    this.details = params.details
    this.isNetworkError = params.isNetworkError ?? false
  }
}

const NETWORK_CODES = new Set<string>([
  AxiosError.ERR_NETWORK,
  AxiosError.ECONNABORTED,
  AxiosError.ETIMEDOUT,
])

/** Normalises any thrown value into an `ApiError` so the UI deals with one shape. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (isAxiosError<ApiErrorBody>(error)) {
    if (error.response) {
      const body = error.response.data
      return new ApiError({
        status: error.response.status,
        code: body?.code ?? `http_${error.response.status}`,
        message: body?.message ?? error.message,
        details: body?.details,
      })
    }
    return new ApiError({
      status: 0,
      code: NETWORK_CODES.has(error.code ?? '') ? 'network_error' : (error.code ?? 'unknown'),
      message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
      isNetworkError: true,
    })
  }

  if (error instanceof Error) {
    return new ApiError({ status: 0, code: 'unknown', message: error.message })
  }
  return new ApiError({ status: 0, code: 'unknown', message: 'Erro inesperado.' })
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** Transient failures are retried by TanStack Query; everything else fails fast. */
export function isTransientError(error: unknown): boolean {
  const apiError = toApiError(error)
  return apiError.isNetworkError || apiError.status >= 500 || apiError.status === 429
}
