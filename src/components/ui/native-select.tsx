import { forwardRef, type SelectHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export type NativeSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  /** `field` is the bordered form select of the Figma forms; `inline` is the toolbar sort control. */
  appearance?: 'field' | 'inline'
}

/**
 * Styled native `<select>`. Chosen over the Radix Select for the sort control because the
 * native element is lighter, fully keyboard accessible and works with form submission.
 * The chevron is the Figma "Iconly/Two-tone/Arrow - Down 2" asset.
 */
const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, appearance = 'field', ...props }, ref) => (
    <div className={cn('relative', appearance === 'inline' ? 'inline-block' : 'w-full')}>
      <select
        ref={ref}
        className={cn(
          'cursor-pointer appearance-none bg-transparent text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive',
          appearance === 'field'
            ? 'h-10 w-full rounded-md border border-input py-2 pr-9 pl-3 text-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40'
            : 'h-6 rounded-sm py-0 pr-6 pl-0 text-[15px] focus-visible:ring-2 focus-visible:ring-ring/60',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <img
        src="/assets/icons/arrow-down.svg"
        alt=""
        width={11}
        height={6}
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2',
          appearance === 'field' ? 'right-3' : 'right-1',
        )}
      />
    </div>
  ),
)
NativeSelect.displayName = 'NativeSelect'

export { NativeSelect }
