import { Heart } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { NftSummary } from '@/types/api'

import { useFavorites, useToggleFavorite } from '../hooks'

interface FavoriteButtonProps {
  nftId: string
  name: string
  summary?: NftSummary
  /** `overlay` floats over the card image; `inline` sits next to the detail title. */
  variant?: 'overlay' | 'inline'
  className?: string
}

export function FavoriteButton({
  nftId,
  name,
  summary,
  variant = 'overlay',
  className,
}: FavoriteButtonProps) {
  const favorites = useFavorites()
  const { toggle, pendingNftId } = useToggleFavorite()
  const active = favorites.isFavorite(nftId)
  const pending = pendingNftId === nftId

  return (
    <button
      type="button"
      onClick={() => toggle(nftId, active, summary)}
      aria-pressed={active}
      aria-busy={pending || undefined}
      aria-label={active ? `Remover ${name} dos favoritos` : `Favoritar ${name}`}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-full text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
        variant === 'overlay'
          ? 'size-9 bg-background/80 backdrop-blur hover:bg-background'
          : 'size-10 border border-border bg-card hover:bg-accent',
        active && 'text-primary',
        className,
      )}
      data-testid="favorite-toggle"
      data-active={active}
    >
      <Heart className={cn('size-4', active && 'fill-current')} aria-hidden="true" />
    </button>
  )
}
