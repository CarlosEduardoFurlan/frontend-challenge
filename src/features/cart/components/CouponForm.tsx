import { Tag, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toApiError } from '@/services/api/errors'
import { cn } from '@/lib/utils'

import { useApplyCoupon, useRemoveCoupon } from '../hooks'

interface CouponFormProps {
  appliedCode: string | null
  description?: string | null
  /** `desktop`: labelled field with the attached button (11:1278); `mobile`: pill field (16:360). */
  variant?: 'desktop' | 'mobile'
}

/** Figma "Código promocional": field with the attached "Aplicar" button. */
export function CouponForm({ appliedCode, description, variant = 'desktop' }: CouponFormProps) {
  const apply = useApplyCoupon()
  const remove = useRemoveCoupon()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const mobile = variant === 'mobile'

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
        {mobile ? null : <p className="text-sm font-bold">Código promocional</p>}
        <div
          className={cn(
            'flex h-10 items-center justify-between gap-3 border border-primary px-3',
            mobile ? 'h-[50px] rounded-full px-5' : 'rounded-md',
          )}
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
      <Label htmlFor="coupon-code" className={cn('text-sm font-bold', mobile && 'sr-only')}>
        Código promocional
      </Label>
      <div
        className={cn(
          'flex border border-input focus-within:border-primary',
          mobile ? 'h-[50px] rounded-full' : 'h-10 rounded-md',
        )}
      >
        <Input
          id="coupon-code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="Digite o código promocional..."
          autoCapitalize="characters"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'coupon-error' : 'coupon-hint'}
          className={cn(
            'h-full rounded-r-none border-0 focus-visible:ring-0',
            mobile ? 'rounded-l-full pl-5 text-sm' : 'text-xs',
          )}
          data-testid="coupon-input"
        />
        <Button
          type="submit"
          className={cn(
            'h-full',
            mobile
              ? 'rounded-full bg-[linear-gradient(90deg,#e89b55_0%,#d28a4c_100%)] px-6 text-lg'
              : 'rounded-l-none px-5',
          )}
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
