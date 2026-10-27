import { http } from 'msw'

import { issuesToDetails } from '@/features/auth/schemas'
import { changePasswordBodySchema, updateProfileBodySchema } from '@/features/profile/schemas'
import { env } from '@/lib/env'

import { hashPassword, randomSalt } from '../lib/crypto'
import { httpError, json, readBody, requireUser, toPublicUser, withScenario } from '../lib/http'
import { getDb, persist } from '../persistence/db'

export const profileHandlers = [
  http.get(
    `${env.apiUrl}/profile`,
    withScenario(({ request }) => {
      const { user } = requireUser(request)
      return json(toPublicUser(user))
    }),
  ),

  http.patch(
    `${env.apiUrl}/profile`,
    withScenario(async ({ request }) => {
      const { user } = requireUser(request)
      const parsed = updateProfileBodySchema.safeParse(await readBody<unknown>(request))
      if (!parsed.success) {
        throw httpError(
          422,
          'validation_error',
          'Revise os campos destacados.',
          issuesToDetails(parsed.error),
        )
      }
      const { name, username, bio, avatarUrl } = parsed.data
      if (username !== undefined && username !== user.username) {
        const taken = getDb().users.some((u) => u.id !== user.id && u.username === username)
        if (taken) {
          throw httpError(409, 'conflict', 'Nome de usuário indisponível.', {
            username: ['Este nome de usuário já está em uso.'],
          })
        }
        user.username = username
      }
      if (name !== undefined) user.name = name
      if (bio !== undefined) user.bio = bio
      if (avatarUrl !== undefined) user.avatarUrl = avatarUrl
      persist()
      return json(toPublicUser(user))
    }),
  ),

  http.post(
    `${env.apiUrl}/profile/password`,
    withScenario(async ({ request }) => {
      const { user } = requireUser(request)
      const parsed = changePasswordBodySchema.safeParse(await readBody<unknown>(request))
      if (!parsed.success) {
        throw httpError(
          422,
          'validation_error',
          'Revise os campos destacados.',
          issuesToDetails(parsed.error),
        )
      }
      const currentHash = await hashPassword(parsed.data.currentPassword, user.salt)
      if (currentHash !== user.passwordHash) {
        throw httpError(422, 'validation_error', 'Senha atual incorreta.', {
          currentPassword: ['A senha atual não confere.'],
        })
      }
      if (parsed.data.newPassword === parsed.data.currentPassword) {
        throw httpError(422, 'validation_error', 'Escolha uma senha diferente.', {
          newPassword: ['A nova senha deve ser diferente da atual.'],
        })
      }
      user.salt = randomSalt()
      user.passwordHash = await hashPassword(parsed.data.newPassword, user.salt)
      persist()
      return new Response(null, { status: 204 })
    }),
  ),
]
