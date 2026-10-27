import { Heart, Link2, Mail, Share2 } from 'lucide-react'
import type { ReactNode } from 'react'

import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { EthPrice } from '@/components/shared/EthPrice'
import { QuantityStepper } from '@/components/shared/QuantityStepper'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CATEGORY_LABELS } from '@/features/catalog/search-params'
import { formatDate, tokenId } from '@/lib/format'
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

/**
 * Figma "Desktop / Detalhes do NFT" (10:244): breadcrumb, gallery on the left, then title,
 * price with the collectors line, "Sobre este NFT", edition chips, quantity + actions, token
 * metadata and share links. Below, the "Detalhes do NFT" tabs over a hairline.
 */
export function NftDetail({ nft, favoriteSlot, renderActions, updateNotice }: NftDetailProps) {
  const selection = usePurchaseSelection(nft)
  const soldOut = nft.available <= 0
  const lineTotal = selection.edition
    ? mulEth(selection.edition.priceEth, selection.quantity)
    : null
  const shareUrl = typeof window === 'undefined' ? '' : window.location.href
  const shareText = `${nft.name} na KURIO`

  return (
    <article
      className="container-page pt-8"
      data-testid="nft-detail"
      data-nft-version={nft.version}
    >
      <Breadcrumbs
        items={[
          { label: 'Início', to: '/' },
          { label: 'Mercado', to: '/', hash: 'catalogo' },
          { label: nft.name },
        ]}
      />

      {updateNotice ? <div className="mt-4">{updateNotice}</div> : null}

      <div className="mt-5 grid gap-8 lg:grid-cols-[568px_minmax(0,1fr)] lg:gap-[37px]">
        <NftGallery name={nft.name} images={nft.images} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-2xl leading-tight font-bold sm:text-[28px]">{nft.name}</h1>
              {soldOut ? <Badge variant="muted">Esgotado</Badge> : null}
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <EthPrice
                value={selection.edition?.priceEth ?? nft.priceEth}
                className="text-2xl font-bold text-text-accent"
              />
              <p className="inline-flex items-center gap-1.5 text-sm">
                <Heart className="size-3.5 fill-primary text-primary" aria-hidden="true" />
                <span className="tabular-nums">{nft.likes}</span> curtidas de colecionadores
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-[15px] leading-none font-bold">Sobre este NFT:</h2>
            <p className="text-sm leading-6 text-muted-foreground">{nft.description}</p>
          </div>

          <EditionSelector
            editions={nft.editions}
            value={selection.editionId}
            onChange={selection.setEditionId}
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
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
                    ? `Máximo de ${selection.maxQuantity} unidade${selection.maxQuantity === 1 ? '' : 's'} nesta edição · total `
                    : 'Edição indisponível no momento'}
                  {selection.maxQuantity > 0 ? (
                    <EthPrice value={lineTotal ?? '0'} className="font-bold text-text-accent" />
                  ) : null}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {renderActions && selection.editionId
                ? renderActions({
                    editionId: selection.editionId,
                    quantity: selection.quantity,
                    canBuy: selection.canBuy,
                  })
                : null}
              {favoriteSlot}
            </div>
          </div>

          <dl className="flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
            <div className="flex gap-1">
              <dt>ID do token:</dt>
              <dd className="font-mono">{tokenId(nft.id)}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Coleção:</dt>
              <dd>{nft.collection}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Atributos:</dt>
              <dd>{nft.traits.map((trait) => trait.value).join(', ')}</dd>
            </div>
          </dl>

          <div className="flex items-center gap-3">
            <h2 className="text-[15px] leading-none font-bold">Compartilhar este NFT:</h2>
            <ul className="flex items-center gap-2">
              <li>
                <button
                  type="button"
                  onClick={() => void navigator.clipboard?.writeText(shareUrl)}
                  aria-label="Copiar link do NFT"
                  className="inline-flex size-6 cursor-pointer items-center justify-center rounded-sm text-text-accent outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Link2 className="size-4" aria-hidden="true" />
                </button>
              </li>
              <li>
                <a
                  href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`}
                  aria-label="Compartilhar por e-mail"
                  className="inline-flex size-6 items-center justify-center rounded-sm text-text-accent outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Mail className="size-4" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Compartilhar nas redes sociais"
                  className="inline-flex size-6 items-center justify-center rounded-sm text-text-accent outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Share2 className="size-4" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details" className="mt-20">
        <TabsList>
          <TabsTrigger value="details">Detalhes do NFT</TabsTrigger>
          <TabsTrigger value="traits">Atributos ({nft.traits.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="flex flex-col gap-4 text-sm leading-6">
          <p className="text-muted-foreground">
            {nft.name} é uma obra digital da coleção {nft.collection}, categoria{' '}
            {CATEGORY_LABELS[nft.category]}, criada por {nft.creator.name}. Cada atributo fica
            armazenado nos metadados do token e verificado na rede.
          </p>
          <p className="text-muted-foreground">{nft.description}</p>
          <dl className="flex flex-col gap-2">
            <div>
              <dt className="font-bold">Rede:</dt>
              <dd className="text-muted-foreground">
                Cunhado na {NETWORKS[nft.network].label} com procedência imutável e metadados
                verificáveis.
              </dd>
            </div>
            <div>
              <dt className="font-bold">Edições:</dt>
              <dd className="text-muted-foreground">
                {nft.editions
                  .map((edition) => `${edition.name}: ${edition.available} de ${edition.total}`)
                  .join(' · ')}
              </dd>
            </div>
            <div>
              <dt className="font-bold">Publicado em:</dt>
              <dd className="text-muted-foreground">{formatDate(nft.createdAt)}</dd>
            </div>
          </dl>
        </TabsContent>
        <TabsContent value="traits">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
            {nft.traits.map((trait) => (
              <div key={trait.label} className="rounded-lg bg-card p-3">
                <dt className="text-xs text-muted-foreground">{trait.label}</dt>
                <dd className="font-bold">{trait.value}</dd>
              </div>
            ))}
            <div className="rounded-lg bg-card p-3">
              <dt className="text-xs text-muted-foreground">Criador</dt>
              <dd className="font-bold">{nft.creator.name}</dd>
            </div>
          </dl>
        </TabsContent>
      </Tabs>
    </article>
  )
}
