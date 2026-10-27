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
      className={cn(
        'group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-card transition-colors focus-within:border-primary/60 hover:border-primary/60',
        className,
      )}
      data-testid="nft-card"
      data-nft-id={id}
    >
      <div className="relative">
        <Link
          to="/nft/$nftId"
          params={{ nftId: id }}
          className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
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
        {favoriteSlot ? <div className="absolute top-2 right-2">{favoriteSlot}</div> : null}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="truncate text-sm font-semibold">
          <Link
            to="/nft/$nftId"
            params={{ nftId: id }}
            className="outline-none hover:underline focus-visible:underline"
            tabIndex={-1}
          >
            {name}
          </Link>
        </h3>
        <p className="truncate text-xs text-muted-foreground">{collection}</p>
        <div className="mt-1 flex items-center justify-between gap-2 text-sm">
          <EthPrice value={priceEth} className="font-semibold text-text-accent" />
          <span className="text-xs text-muted-foreground" data-testid="nft-card-available">
            {soldOut ? 'Indisponível' : `${available} disp.`}
          </span>
        </div>
      </div>
    </article>
  )
}

export function NftCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex flex-col gap-3 rounded-xl border border-border bg-card p-3', className)}
      data-testid="nft-card-skeleton"
    >
      <Skeleton className="aspect-square w-full rounded-lg" />
      {/* Line heights mirror the real card (text-sm / text-xs / text-sm rows) to avoid shifts. */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-1 flex h-5 items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  )
}
