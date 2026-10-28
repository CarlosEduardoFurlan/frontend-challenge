import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  title: string
  description?: string
  actions?: ReactNode
  as?: 'h1' | 'h2' | 'h3'
  className?: string
  id?: string
}

export function SectionHeading({
  title,
  description,
  actions,
  as: Heading = 'h2',
  className,
  id,
}: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-x-6 gap-y-3', className)}>
      <div className="min-w-0">
        <Heading id={id} className="font-display text-lg leading-tight uppercase sm:text-xl">
          {title}
        </Heading>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
