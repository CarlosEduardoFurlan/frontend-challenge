import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

/**
 * Shimmer skeleton. Always give it explicit dimensions (or aspect ratio) so the final
 * content does not shift the layout when it arrives.
 */
function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn('skeleton', className)} {...props} />
}

export { Skeleton }
