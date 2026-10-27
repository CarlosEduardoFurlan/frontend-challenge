import { http, HttpResponse } from 'msw'

import { env } from '@/lib/env'

export const healthHandlers = [
  http.get(`${env.apiUrl}/health`, () => HttpResponse.json({ status: 'ok' })),
]
