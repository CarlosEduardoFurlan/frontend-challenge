import { Heart } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { NftSummary } from '@/types/api'

import { useFavorites, useToggleFavorite } from '../hooks'

interface FavoriteButtonProps {
  nftId: string
  name: string
  summary?: NftSummary
  /**
   * `overlay` floats over the card image; `inline` is the outlined "Favoritar" button of the
   * desktop detail frame; `circle` is the round button over the artwork on the mobile frame.
   */
  variant?: 'overlay' | 'inline' | 'circle'
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
        'inline-flex cursor-pointer items-center justify-center gap-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
        variant === 'overlay'
          ? 'size-9 rounded-full bg-background/80 text-foreground backdrop-blur hover:bg-background'
          : variant === 'circle'
            ? 'size-[46px] rounded-full bg-background/70 text-text-accent backdrop-blur hover:bg-background [&_svg]:size-5'
            : 'h-10 rounded-md border border-primary px-4 text-sm font-bold text-text-accent hover:bg-primary/10',
        active && variant === 'overlay' && 'text-primary',
        className,
      )}
      data-testid="favorite-toggle"
      data-active={active}
    >
      <Heart className={cn('size-4', active && 'fill-current')} aria-hidden="true" />
      {variant === 'inline' ? (active ? 'Favoritado' : 'Favoritar') : null}
    </button>
  )
}
