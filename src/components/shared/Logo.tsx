import { Link } from '@tanstack/react-router'

import { cn } from '@/lib/utils'

/** KURIO wordmark (Figma "Logo": Roboto Mono Bold 14, letter-spacing 1.4px, color/foreground). */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        'inline-flex items-center rounded-sm text-sm font-bold tracking-[1.4px] text-foreground uppercase outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <span>KURIO</span>
      <span className="sr-only">, ir para o início</span>
    </Link>
  )
}
