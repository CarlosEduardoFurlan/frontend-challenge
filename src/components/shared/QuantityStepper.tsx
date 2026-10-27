import { Minus, Plus } from 'lucide-react'
import { useId } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuantityStepperProps {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
  label: string
  className?: string
  size?: 'sm' | 'default'
}

/** Integer quantity control. The input is a real number field for keyboard and screen readers. */
export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  disabled,
  label,
  className,
  size = 'default',
}: QuantityStepperProps) {
  const id = useId()
  const clamp = (next: number) => Math.min(max, Math.max(min, Math.trunc(next)))

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <Button
        variant="outline"
        size={size === 'sm' ? 'icon-sm' : 'icon'}
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        aria-label={`Diminuir ${label}`}
        data-testid="qty-decrement"
      >
        <Minus aria-hidden="true" />
      </Button>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10)
          if (!Number.isNaN(parsed)) onChange(clamp(parsed))
        }}
        className={cn(
          'w-12 rounded-md border border-input bg-card text-center text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50',
          size === 'sm' ? 'h-8' : 'h-10',
        )}
        data-testid="qty-input"
      />
      <Button
        variant="outline"
        size={size === 'sm' ? 'icon-sm' : 'icon'}
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        aria-label={`Aumentar ${label}`}
        data-testid="qty-increment"
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  )
}
