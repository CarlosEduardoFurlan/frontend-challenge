import { http } from 'msw'

import { issuesToDetails, loginSchema, registerBodySchema } from '@/features/auth/schemas'
import { env } from '@/lib/env'
import type { Session } from '@/types/api'

import { hashPassword, randomId, randomSalt } from '../lib/crypto'
import {
  findSession,
  httpError,
  json,
  readBearer,
  readBody,
  toPublicUser,
  withScenario,
} from '../lib/http'
import { getCurrentScenario } from '../lib/scenario-state'
import { getDb, persist, type UserRecord } from '../persistence/db'

function createSession(user: UserRecord): Session {
  const db = getDb()
  const now = Date.now()
  const session = {
    token: randomId('tok'),
    userId: user.id,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + getCurrentScenario().sessionTtlMs).toISOString(),
  }
  db.sessions.push(session)
  persist()
  return { token: session.token, user: toPublicUser(user), expiresAt: session.expiresAt }
}

export const authHandlers = [
  http.post(
    `${env.apiUrl}/auth/register`,
    withScenario(async ({ request }) => {
      const parsed = registerBodySchema.safeParse(await readBody<unknown>(request))
      if (!parsed.success) {
        throw httpError(
          422,
          'validation_error',
          'Revise os campos destacados.',
          issuesToDetails(parsed.error),
        )
      }
      const db = getDb()
      const { name, email, password } = parsed.data
      if (getCurrentScenario().registerConflict || db.users.some((u) => u.email === email)) {
        throw httpError(409, 'email_taken', 'Já existe uma conta com este e-mail.', {
          email: ['Este e-mail já está cadastrado.'],
        })
      }
      const salt = randomSalt()
      const user: UserRecord = {
        id: randomId('usr'),
        name,
        username: email.split('@')[0] ?? name.toLowerCase().replace(/\s+/g, '.'),
        email,
        bio: '',
        avatarUrl: null,
        salt,
        passwordHash: await hashPassword(password, salt),
        createdAt: new Date().toISOString(),
      }
      db.users.push(user)
      db.favorites[user.id] = []
      db.wallets[user.id] = {}
      persist()
      return json(createSession(user), { status: 201 })
    }),
  ),

  http.post(
    `${env.apiUrl}/auth/login`,
    withScenario(async ({ request }) => {
      const parsed = loginSchema.safeParse(await readBody<unknown>(request))
      if (!parsed.success) {
        throw httpError(
          422,
          'validation_error',
          'Revise os campos destacados.',
          issuesToDetails(parsed.error),
        )
      }
      const user = getDb().users.find((u) => u.email === parsed.data.email)
      const valid =
        user && (await hashPassword(parsed.data.password, user.salt)) === user.passwordHash
      if (!user || !valid) {
        throw httpError(401, 'invalid_credentials', 'E-mail ou senha inválidos.')
      }
      return json(createSession(user))
    }),
  ),

  http.get(
    `${env.apiUrl}/auth/session`,
    withScenario(({ request }) => {
      if (!readBearer(request)) throw httpError(401, 'unauthorized', 'Sem sessão ativa.')
      const session = findSession(request)
      if (!session?.token)
        throw httpError(401, 'session_expired', 'Sua sessão expirou. Entre novamente.')
      const user = getDb().users.find((u) => u.id === session.userId)
      if (!user) throw httpError(401, 'unauthorized', 'Sessão inválida.')
      const body: Session = {
        token: session.token,
        user: toPublicUser(user),
        expiresAt: session.expiresAt,
      }
      return json(body)
    }),
  ),

  http.post(
    `${env.apiUrl}/auth/logout`,
    withScenario(({ request }) => {
      const token = readBearer(request)
      const db = getDb()
      db.sessions = db.sessions.filter((s) => s.token !== token)
      persist()
      return new Response(null, { status: 204 })
    }),
  ),
]
