import { z } from 'zod'

import { nameSchema, passwordSchema } from '@/features/auth/schemas'

export const AVATAR_MAX_BYTES = 300 * 1024

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.')
  .max(30, 'O nome de usuário deve ter no máximo 30 caracteres.')
  .regex(/^[a-z0-9._]+$/, 'Use apenas letras minúsculas, números, ponto e sublinhado.')

export const bioSchema = z.string().trim().max(280, 'A bio deve ter no máximo 280 caracteres.')

export const avatarDataUrlSchema = z
  .string()
  .regex(/^data:image\/(png|jpeg|webp);base64,/, 'Envie uma imagem PNG, JPEG ou WebP.')
  .refine((value) => value.length * 0.75 <= AVATAR_MAX_BYTES, 'A imagem deve ter no máximo 300 KB.')

export const updateProfileSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  bio: bioSchema,
  avatarUrl: z.union([avatarDataUrlSchema, z.string().startsWith('/'), z.null()]),
})
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

/** Server-side body: every field optional (PATCH semantics). */
export const updateProfileBodySchema = updateProfileSchema.partial()

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual.'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'A nova senha deve ser diferente da atual.',
    path: ['newPassword'],
  })
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual.'),
  newPassword: passwordSchema,
})
