import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { Slot } from 'radix-ui'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

/**
 * Figma buttons: 40px high, 6px radius, Roboto Mono Bold 16 on color/primary with ink text
 * ("EXPLORAR", "Aplicar", "COMPRAR", "Conectar e finalizar"). The outlined variant is the
 * "Favoritar" button of the detail frame (1px primary border, text-accent label).
 */
const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-base font-bold whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary:
          'border border-border-soft bg-surface-dark text-foreground hover:border-primary/60',
        outline:
          'border border-primary bg-transparent text-text-accent hover:bg-primary/10 focus-visible:ring-offset-0',
        ghost: 'text-foreground hover:bg-accent',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'h-auto px-0 font-bold text-text-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-6',
        sm: 'h-9 px-3',
        lg: 'h-10 px-8',
        /** Mobile primary action of the checkout frame: 60px pill with a primary gradient. */
        pill: 'h-[60px] rounded-full bg-[linear-gradient(90deg,#e89b55_0%,#d28a4c_100%)] px-8 text-lg',
        icon: 'size-10',
        'icon-sm': 'size-[35px] rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Shows a spinner, disables the button and announces the busy state. */
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, children, disabled, ...props },
    ref,
  ) => {
    // Slot requires a single child, so the spinner is only rendered for real buttons.
    if (asChild) {
      return (
        <Slot.Root
          ref={ref}
          className={cn(buttonVariants({ variant, size, className }))}
          aria-disabled={disabled || undefined}
          {...props}
        >
          {children}
        </Slot.Root>
      )
    }
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        type={props.type ?? 'button'}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
