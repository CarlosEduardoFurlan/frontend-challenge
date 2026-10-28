import { Label as LabelPrimitive } from 'radix-ui'
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'

import { cn } from '@/lib/utils'

interface LabelProps extends ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  /** Renders the asterisk of the Figma forms ("Nome de exibição *"). */
  required?: boolean
}

/** Figma form label: 15px regular, foreground, asterisk in text-accent for required fields. */
const Label = forwardRef<ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        'text-[15px] leading-none font-normal text-foreground select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span className="ml-0.5 text-text-accent" aria-hidden="true">
          *
        </span>
      ) : null}
    </LabelPrimitive.Root>
  ),
)
Label.displayName = 'Label'

export { Label }
