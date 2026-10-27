import { z } from 'zod'

/**
 * Validation schemas shared by the forms (react-hook-form) and the mock API handlers, so the
 * client and the simulated server enforce the same rules.
 */
export const emailSchema = z.email({ message: 'Informe um e-mail válido.' }).trim().toLowerCase()

export const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres.')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número.')
  .regex(/[A-Za-z]/, 'A senha deve conter pelo menos uma letra.')

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Informe seu nome.')
  .max(80, 'O nome deve ter no máximo 80 caracteres.')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe sua senha.'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirme a senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })
export type RegisterInput = z.infer<typeof registerSchema>

/** Server-side body validation (no confirmation field). */
export const registerBodySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})

/** Converts Zod issues into the `details` map of the API error envelope. */
export function issuesToDetails(error: z.ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.map(String).join('.') || '_'
    ;(details[key] ??= []).push(issue.message)
  }
  return details
}
