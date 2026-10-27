import { forwardRef, type TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

/** Same field style as `Input` (checkout frame: "Observação do colecionador"). */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground transition-colors outline-none placeholder:text-brass focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/30',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export { Textarea }
