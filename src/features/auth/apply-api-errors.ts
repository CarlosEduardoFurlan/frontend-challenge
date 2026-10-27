import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import { isApiError } from '@/services/api/errors'

/**
 * Maps the `details` of a 409/422 API error onto form fields. Returns the message to show at the
 * form level (for errors without a matching field) or `null` when every error was assigned.
 */
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: Array<Path<T>>,
): string | null {
  if (!isApiError(error)) return 'Erro inesperado. Tente novamente.'
  let unassigned = false
  if (error.details) {
    for (const [field, messages] of Object.entries(error.details)) {
      if (fields.includes(field as Path<T>)) {
        setError(field as Path<T>, { type: 'server', message: messages.join(' ') })
      } else {
        unassigned = true
      }
    }
  }
  if (!error.details || unassigned) return error.message
  return null
}
