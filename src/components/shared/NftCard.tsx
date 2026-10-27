import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { DecimalString } from '@/lib/money-format'
import { cn } from '@/lib/utils'

import { EthPrice } from './EthPrice'
import { NftImage } from './NftImage'

export interface NftCardProps {
  id: string
  name: string
  collection: string
  imageUrl: string
  priceEth: DecimalString
  available: number
  /** Favourite toggle rendered over the image (see features/favorites). */
  favoriteSlot?: ReactNode
  /** Extra badge (e.g. "Preço atualizado") rendered on the image. */
  badge?: ReactNode
  className?: string
  priority?: boolean
}

/**
 * Figma product card (home frame, 258 wide): a 300px color/surface-card box holding the
 * 250px artwork with 15px radius, then the name (16 regular, foreground) and the price
 * (18 bold, text-accent) 12px apart. The box has square corners in the design.
 */
export function NftCard({
  id,
  name,
  collection,
  imageUrl,
  priceEth,
  available,
  favoriteSlot,
  badge,
  className,
  priority,
}: NftCardProps) {
  const soldOut = available <= 0

  return (
    <article
      className={cn('group relative flex flex-col gap-3', className)}
      data-testid="nft-card"
      data-nft-id={id}
    >
      <div className="relative flex aspect-[258/300] w-full items-center justify-center bg-card p-[4px] sm:p-[8px]">
        <Link
          to="/nft/$nftId"
          params={{ nftId: id }}
          className="block w-full max-w-[250px] rounded-art outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          aria-label={`${name}, ${collection}`}
        >
          <NftImage src={imageUrl} alt={`Arte do NFT ${name}`} priority={priority} />
        </Link>
        {soldOut ? (
          <Badge variant="muted" className="absolute top-2 left-2">
            Esgotado
          </Badge>
        ) : badge ? (
          <div className="absolute top-2 left-2">{badge}</div>
        ) : null}
        {favoriteSlot ? (
          <div className="absolute top-2 right-2 transition-opacity lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
            {favoriteSlot}
          </div>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="truncate text-base leading-4 font-normal">
          <Link
            to="/nft/$nftId"
            params={{ nftId: id }}
            className="outline-none hover:text-text-accent focus-visible:underline"
            tabIndex={-1}
          >
            {name}
          </Link>
        </h3>
        <p className="truncate text-xs leading-4 text-brass">{collection}</p>
        <div className="flex items-baseline justify-between gap-2">
          <EthPrice value={priceEth} className="text-lg leading-4 font-bold text-text-accent" />
          <span className="text-xs leading-4 text-brass" data-testid="nft-card-available">
            {soldOut ? 'Indisponível' : `${available} disp.`}
          </span>
        </div>
      </div>
    </article>
  )
}

export function NftCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3', className)} data-testid="nft-card-skeleton">
      <div className="flex aspect-[258/300] w-full items-center justify-center bg-card p-[4px] sm:p-[8px]">
        <Skeleton className="aspect-square w-full max-w-[250px] rounded-art" />
      </div>
      {/* Line heights mirror the real card (16 / 16 / 16 rows, 6px gaps) to avoid shifts. */}
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex h-4 items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  )
}
