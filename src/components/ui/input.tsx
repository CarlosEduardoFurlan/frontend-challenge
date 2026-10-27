import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

/**
 * Figma form field (checkout / wallets frames): 40px high, transparent on the ink background,
 * 1px color/border-soft outline, 14px text, placeholder in color/secondary (brass).
 */
const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'flex h-10 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground transition-colors outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-brass focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/30',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }
