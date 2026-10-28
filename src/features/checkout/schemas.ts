import { z } from 'zod'

import { emailSchema, nameSchema } from '@/features/auth/schemas'

/** Brazilian CPF: 11 digits, formatted or not. Only structural validation (check digits). */
export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false
  const calc = (slice: number) => {
    let sum = 0
    for (let i = 0; i < slice; i++) sum += Number(digits[i]) * (slice + 1 - i)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }
  return calc(9) === Number(digits[9]) && calc(10) === Number(digits[10])
}

export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export const collectorSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  document: z.string().trim().min(1, 'Informe o CPF.').refine(isValidCpf, 'CPF inválido.'),
})
export type CollectorInput = z.infer<typeof collectorSchema>

export const checkoutFormSchema = collectorSchema.extend({
  acceptedTerms: z.literal(true, { message: 'Você precisa aceitar os termos para continuar.' }),
})
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>
