import { Link } from '@tanstack/react-router'

import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        'inline-flex items-center rounded-md font-display text-lg text-foreground uppercase outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <span className="font-bold tracking-[0.18em]">KURIO</span>
      <span className="sr-only">, ir para o início</span>
    </Link>
  )
}
