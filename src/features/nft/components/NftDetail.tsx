import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

import { EthPrice } from '@/components/shared/EthPrice'
import { QuantityStepper } from '@/components/shared/QuantityStepper'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CATEGORY_LABELS } from '@/features/catalog/search-params'
import { formatDate, initials } from '@/lib/format'
import { mulEth } from '@/lib/money'
import { NETWORKS } from '@/mocks/fixtures/networks'
import type { Nft } from '@/types/api'

import { usePurchaseSelection } from '../hooks/use-purchase-selection'
import { EditionSelector } from './EditionSelector'
import { NftGallery } from './NftGallery'

export interface NftDetailProps {
  nft: Nft
  /** Favourite toggle (wired by the favourites feature). */
  favoriteSlot?: ReactNode
  /** Purchase actions receive the current selection (wired by the cart feature). */
  renderActions?: (selection: { editionId: string; quantity: number; canBuy: boolean }) => ReactNode
  /** Banner shown when a realtime update changed this NFT. */
  updateNotice?: ReactNode
}

export function NftDetail({ nft, favoriteSlot, renderActions, updateNotice }: NftDetailProps) {
  const selection = usePurchaseSelection(nft)
  const soldOut = nft.available <= 0
  const lineTotal = selection.edition
    ? mulEth(selection.edition.priceEth, selection.quantity)
    : null

  return (
    <article
      className="container-page py-8"
      data-testid="nft-detail"
      data-nft-version={nft.version}
    >
      <nav aria-label="Navegação estrutural" className="mb-6 text-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" /> Voltar ao catálogo
        </Link>
      </nav>

      {updateNotice}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <NftGallery name={nft.name} images={nft.images} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{CATEGORY_LABELS[nft.category]}</Badge>
              <Badge variant="outline">{NETWORKS[nft.network].label}</Badge>
              {soldOut ? <Badge variant="muted">Esgotado</Badge> : null}
            </div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-display text-2xl leading-tight uppercase sm:text-3xl">
                {nft.name}
              </h1>
              {favoriteSlot}
            </div>
            <p className="text-sm text-muted-foreground">
              Coleção <span className="font-medium text-foreground">{nft.collection}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={nft.creator.avatarUrl} alt="" />
              <AvatarFallback>{initials(nft.creator.name)}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="text-muted-foreground">Criado por</p>
              <p className="font-medium">{nft.creator.name}</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{nft.description}</p>

          <Separator />

          <EditionSelector
            editions={nft.editions}
            value={selection.editionId}
            onChange={selection.setEditionId}
          />

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Quantidade</span>
              <QuantityStepper
                label="quantidade"
                value={selection.quantity}
                min={1}
                max={Math.max(1, selection.maxQuantity)}
                onChange={selection.setQuantity}
                disabled={!selection.canBuy}
              />
              {selection.edition ? (
                <p className="text-xs text-muted-foreground" data-testid="quantity-hint">
                  {selection.maxQuantity > 0
                    ? `Máximo de ${selection.maxQuantity} unidade${selection.maxQuantity === 1 ? '' : 's'} nesta edição`
                    : 'Edição indisponível no momento'}
                </p>
              ) : null}
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <EthPrice
                value={lineTotal ?? '0'}
                className="text-2xl font-semibold text-text-accent"
              />
            </div>
          </div>

          {renderActions && selection.editionId
            ? renderActions({
                editionId: selection.editionId,
                quantity: selection.quantity,
                canBuy: selection.canBuy,
              })
            : null}

          <Separator />

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {nft.traits.map((trait) => (
              <div key={trait.label} className="rounded-lg border border-border bg-card p-3">
                <dt className="text-xs text-muted-foreground">{trait.label}</dt>
                <dd className="font-medium">{trait.value}</dd>
              </div>
            ))}
            <div className="rounded-lg border border-border bg-card p-3">
              <dt className="text-xs text-muted-foreground">Publicado em</dt>
              <dd className="font-medium">{formatDate(nft.createdAt)}</dd>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <dt className="text-xs text-muted-foreground">Curtidas</dt>
              <dd className="font-medium tabular-nums">{nft.likes}</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  )
}
