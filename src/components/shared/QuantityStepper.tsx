import { Minus, Plus } from 'lucide-react'
import { useId } from 'react'

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

/**
 * Figma quantity control (detail and cart frames): round primary "−" / "+" buttons with the
 * number in bold between them. The input is a real number field for keyboard and screen readers.
 */
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
  const buttonClass = cn(
    'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40',
    size === 'sm' ? 'size-5 [&_svg]:size-3' : 'size-8 [&_svg]:size-4',
  )

  return (
    <div className={cn('inline-flex items-center', size === 'sm' ? 'gap-1.5' : 'gap-2', className)}>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        aria-label={`Diminuir ${label}`}
        data-testid="qty-decrement"
      >
        <Minus aria-hidden="true" strokeWidth={3} />
      </button>
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
          '[appearance:textfield] rounded-sm bg-transparent text-center font-bold text-foreground tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          size === 'sm' ? 'h-6 w-7 text-base' : 'h-8 w-9 text-lg',
        )}
        data-testid="qty-input"
      />
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        aria-label={`Aumentar ${label}`}
        data-testid="qty-increment"
      >
        <Plus aria-hidden="true" strokeWidth={3} />
      </button>
    </div>
  )
}
