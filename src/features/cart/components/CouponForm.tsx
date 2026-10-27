import { Tag, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toApiError } from '@/services/api/errors'

import { useApplyCoupon, useRemoveCoupon } from '../hooks'

interface CouponFormProps {
  appliedCode: string | null
  description?: string | null
}

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
      <div
        className="flex items-center justify-between gap-3 rounded-lg border border-success/40 bg-success/10 px-3 py-2"
        data-testid="coupon-applied"
      >
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Tag className="size-4 shrink-0 text-success" aria-hidden="true" />
          <span className="font-semibold">{appliedCode}</span>
          {description ? (
            <span className="truncate text-xs text-muted-foreground">{description}</span>
          ) : null}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => remove.mutate()}
          loading={remove.isPending}
          aria-label="Remover cupom"
          data-testid="coupon-remove"
        >
          <X aria-hidden="true" />
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2" noValidate data-testid="coupon-form">
      <Label htmlFor="coupon-code">Cupom de desconto</Label>
      <div className="flex gap-2">
        <Input
          id="coupon-code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Ex.: BEMVINDO10"
          autoCapitalize="characters"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'coupon-error' : undefined}
          data-testid="coupon-input"
        />
        <Button
          type="submit"
          variant="secondary"
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
        <p className="text-xs text-muted-foreground">
          Cupons de demonstração: <Badge variant="outline">BEMVINDO10</Badge>{' '}
          <Badge variant="outline">JUNGLE20</Badge> <Badge variant="outline">FIXO005</Badge>
        </p>
      )}
    </form>
  )
}
