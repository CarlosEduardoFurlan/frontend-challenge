import {
  delay,
  HttpResponse,
  type HttpResponseResolver,
  type JsonBodyType,
  type DefaultBodyType,
  type PathParams,
} from 'msw'

import type { ApiErrorResponse } from '@/types/api'

import { getDb, persist, type SessionRecord, type UserRecord } from '../persistence/db'
import { consumeFailureBudget, getCurrentScenario } from './scenario-state'

/* ----------------------------------------------------------------------------
 * Responses
 * ------------------------------------------------------------------------- */
export function json<T>(body: T, init?: { status?: number; headers?: Record<string, string> }) {
  return HttpResponse.json(body as JsonBodyType, {
    status: init?.status ?? 200,
    headers: init?.headers,
  })
}

export class MockHttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorResponse,
  ) {
    super(body.message)
  }
}

export function httpError(
  status: number,
  code: ApiErrorResponse['code'],
  message: string,
  details?: Record<string, string[]>,
): MockHttpError {
  return new MockHttpError(status, { code, message, details })
}

function errorResponse(error: MockHttpError) {
  return HttpResponse.json(error.body, { status: error.status })
}

/* ----------------------------------------------------------------------------
 * Scenario middleware
 * ------------------------------------------------------------------------- */
function randomBetween(min: number, max: number) {
  return Math.floor(min + Math.random() * Math.max(0, max - min))
}

interface ScenarioOptions {
  /** Marks list endpoints that may be delayed further in the "out of order" scenario. */
  listEndpoint?: boolean
  /** Skip latency/failure injection (mock control endpoints). */
  bypass?: boolean
}

/**
 * Wraps a resolver with the behaviour of the active scenario: latency, network errors and
 * HTTP failure injection. Thrown `MockHttpError`s become JSON error responses.
 */
export function withScenario<
  Params extends PathParams = PathParams,
  RequestBody extends DefaultBodyType = DefaultBodyType,
  ResponseBody extends DefaultBodyType = DefaultBodyType,
>(
  resolver: HttpResponseResolver<Params, RequestBody, ResponseBody>,
  options: ScenarioOptions = {},
): HttpResponseResolver<Params, RequestBody, ResponseBody> {
  const wrapped = async (info: Parameters<typeof resolver>[0]) => {
    const scenario = getCurrentScenario()
    const url = new URL(info.request.url)
    const route = `${info.request.method} ${url.pathname}${url.search}`

    if (!options.bypass) {
      let wait = randomBetween(scenario.latency.min, scenario.latency.max)
      if (scenario.outOfOrder && options.listEndpoint) wait += randomBetween(0, 2500)
      if (wait > 0) await delay(wait)

      if (scenario.networkErrorMatch?.test(route)) {
        return HttpResponse.error()
      }

      for (const rule of scenario.failures) {
        if (!rule.match.test(route)) continue
        if (!consumeFailureBudget(`${scenario.id}:${rule.match.source}`, rule.times)) continue
        const details =
          rule.status === 422 ? validationDetailsFor(url.pathname, info.request.method) : undefined
        return HttpResponse.json(
          { code: rule.code, message: rule.message, details },
          {
            status: rule.status,
          },
        )
      }
    }

    try {
      return await resolver(info)
    } catch (error) {
      if (error instanceof MockHttpError) return errorResponse(error)
      console.error('[mock] unhandled error in', route, error)
      return HttpResponse.json(
        { code: 'internal_error', message: 'Erro interno do servidor simulado.' },
        { status: 500 },
      )
    }
  }
  return wrapped as HttpResponseResolver<Params, RequestBody, ResponseBody>
}

function validationDetailsFor(pathname: string, method: string): Record<string, string[]> {
  if (pathname.includes('/wallets')) {
    return { address: ['Endereço rejeitado pela validação do servidor.'] }
  }
  if (pathname.includes('/profile/password')) {
    return { currentPassword: ['Senha atual incorreta (simulação).'] }
  }
  if (pathname.includes('/profile')) {
    return { username: ['Nome de usuário indisponível (simulação).'] }
  }
  return { _: [`${method} rejeitado pela validação simulada.`] }
}

/* ----------------------------------------------------------------------------
 * Authentication helpers
 * ------------------------------------------------------------------------- */
export function readBearer(request: Request): string | null {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length).trim() || null
}

/** Returns the session for the request or null. Expired sessions are removed. */
export function findSession(request: Request): SessionRecord | null {
  const token = readBearer(request)
  if (!token) return null
  const db = getDb()
  const session = db.sessions.find((s) => s.token === token)
  if (!session) return null
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    db.sessions = db.sessions.filter((s) => s.token !== token)
    persist()
    return { ...session, expiresAt: session.expiresAt, token: '' }
  }
  return session
}

export function requireUser(request: Request): { user: UserRecord; session: SessionRecord } {
  const token = readBearer(request)
  if (!token) throw httpError(401, 'unauthorized', 'Faça login para continuar.')
  const session = findSession(request)
  if (!session || !session.token) {
    throw httpError(401, 'session_expired', 'Sua sessão expirou. Entre novamente.')
  }
  const user = getDb().users.find((u) => u.id === session.userId)
  if (!user) throw httpError(401, 'unauthorized', 'Sessão inválida.')
  return { user, session }
}

export function optionalUser(request: Request): UserRecord | null {
  const session = findSession(request)
  if (!session?.token) return null
  return getDb().users.find((u) => u.id === session.userId) ?? null
}

/** Cart owner key: authenticated user or the guest id sent by the client. */
export function cartOwnerKey(request: Request): string {
  const user = optionalUser(request)
  if (user) return `user:${user.id}`
  const guest = request.headers.get('x-guest-cart-id')
  if (!guest) throw httpError(400, 'validation_error', 'Identificador de carrinho ausente.')
  return `guest:${guest}`
}

export async function readBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T
  } catch {
    throw httpError(400, 'validation_error', 'Corpo da requisição inválido.')
  }
}

export function toPublicUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  }
}
