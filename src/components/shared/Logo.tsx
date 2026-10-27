import { Link } from '@tanstack/react-router'

import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        'inline-flex items-center gap-2 rounded-md font-display text-sm tracking-wide text-foreground uppercase outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      aria-label="NFT Marketplace, ir para o início"
    >
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
        <rect width="32" height="32" rx="6" fill="var(--primary)" />
        <path
          d="M8 24V8h3.2l8.6 10.4V8H23v16h-3.2L11.2 13.6V24z"
          fill="var(--primary-foreground)"
        />
      </svg>
      <span className="hidden sm:inline">NFT Market</span>
    </Link>
  )
}
