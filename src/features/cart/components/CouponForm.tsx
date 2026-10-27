import { Tag, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toApiError } from '@/services/api/errors'

import { useApplyCoupon, useRemoveCoupon } from '../hooks'

interface CouponFormProps {
  appliedCode: string | null
  description?: string | null
}

/** Figma "Código promocional": bold label, bordered field with the attached "Aplicar" button. */
export function CouponForm({ appliedCode, description }: CouponFormProps) {
  const apply = useApplyCoupon()
  const remove = useRemoveCoupon()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    try {
      await apply.mutateAsync(code)
      setCode('')
    } catch (caught) {
      const apiError = toApiError(caught)
      setError(apiError.details?.couponCode?.join(' ') ?? apiError.message)
    }
  }

  if (appliedCode) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold">Código promocional</p>
        <div
          className="flex h-10 items-center justify-between gap-3 rounded-md border border-primary px-3"
          data-testid="coupon-applied"
        >
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Tag className="size-4 shrink-0 text-text-accent" aria-hidden="true" />
            <span className="font-bold">{appliedCode}</span>
            {description ? (
              <span className="truncate text-xs text-muted-foreground">{description}</span>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-8"
            onClick={() => remove.mutate()}
            loading={remove.isPending}
            aria-label="Remover cupom"
            data-testid="coupon-remove"
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2" noValidate data-testid="coupon-form">
      <Label htmlFor="coupon-code" className="text-sm font-bold">
        Código promocional
      </Label>
      <div className="flex h-10 rounded-md border border-input focus-within:border-primary">
        <Input
          id="coupon-code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Digite o código promocional..."
          autoCapitalize="characters"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'coupon-error' : 'coupon-hint'}
          className="h-full rounded-r-none border-0 text-xs focus-visible:ring-0"
          data-testid="coupon-input"
        />
        <Button
          type="submit"
          className="h-full rounded-l-none px-5"
          loading={apply.isPending}
          disabled={!code.trim()}
          data-testid="coupon-apply"
        >
          Aplicar
        </Button>
      </div>
      {error ? (
        <p
          id="coupon-error"
          role="alert"
          className="text-xs text-destructive"
          data-testid="coupon-error"
        >
          {error}
        </p>
      ) : (
        <p id="coupon-hint" className="text-xs text-muted-foreground">
          Cupons de demonstração: BEMVINDO10 · JUNGLE20 · FIXO005
        </p>
      )}
    </form>
  )
}
