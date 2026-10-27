import { Link } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'

import { EthPrice } from '@/components/shared/EthPrice'
import { artworkThumb } from '@/components/shared/NftImage'
import { QuantityStepper } from '@/components/shared/QuantityStepper'
import { Badge } from '@/components/ui/badge'
import { tokenId } from '@/lib/format'
import type { CartItem } from '@/types/api'

interface CartItemRowProps {
  item: CartItem
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
  busy?: boolean
  /** `desktop`: table row (11:1278); `mobile`: rounded card with the artwork on the left (16:360). */
  variant?: 'desktop' | 'mobile'
}

/** Column template shared by the table header and the rows (Figma: NFTs · Preço · Edições · Total). */
export const CART_COLUMNS =
  'grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_120px_120px_130px_36px]'

/**
 * Desktop cart row (70px, color/surface-card, 8px radius): 70px thumbnail, name (16 bold) with
 * "ID do token" (13, text-secondary), unit price and line total in text-accent, the round
 * quantity stepper and the trash icon. Mobile card (16:360): 100px artwork, 18px bold name,
 * "Edição:" line, 20px bold price and the stepper on the right.
 */
export function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
  busy,
  variant = 'desktop',
}: CartItemRowProps) {
  const soldOut = item.available <= 0
  const max = Math.max(1, Math.min(item.available, item.maxPerOrder))
  const priceChanged = item.unitPriceEth !== item.addedPriceEth
  const overLimit = item.quantity > max && !soldOut

  const badges =
    priceChanged || soldOut || overLimit ? (
      <div className="flex flex-wrap gap-1.5 pt-1">
        {priceChanged ? (
          <Badge variant="warning" data-testid="price-changed-badge">
            Preço atualizado
          </Badge>
        ) : null}
        {soldOut ? (
          <Badge variant="destructive" data-testid="sold-out-badge">
            Esgotado
          </Badge>
        ) : overLimit ? (
          <Badge variant="warning" data-testid="limited-badge">
            Apenas {max} disponível(is)
          </Badge>
        ) : null}
      </div>
    ) : null

  if (variant === 'mobile') {
    return (
      <li
        className="relative flex gap-3 rounded-2xl bg-card p-2 pr-3"
        data-testid="cart-item"
        data-cart-item-id={item.id}
        data-nft-id={item.nftId}
      >
        <Link
          to="/nft/$nftId"
          params={{ nftId: item.nftId }}
          className="shrink-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={item.nft.name}
        >
          <img
            src={artworkThumb(item.nft.imageUrl)}
            alt=""
            width={100}
            height={100}
            loading="lazy"
            className="size-[100px] rounded-xl object-cover"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
          <div className="min-w-0 pr-8">
            <h3 className="truncate text-lg leading-6 font-bold">
              <Link
                to="/nft/$nftId"
                params={{ nftId: item.nftId }}
                className="outline-none hover:text-text-accent focus-visible:underline"
              >
                {item.nft.name}
              </Link>
            </h3>
            <p className="truncate text-sm leading-5 text-muted-foreground">
              Edição: {item.edition.name} · {tokenId(item.nftId)}
            </p>
            {badges}
          </div>
          <div className="flex items-end justify-between gap-2">
            <EthPrice
              value={item.lineTotalEth}
              previous={undefined}
              className="text-xl leading-6 font-bold text-text-accent"
            />
            <QuantityStepper
              label={`quantidade de ${item.nft.name}`}
              value={item.quantity}
              min={1}
              max={max}
              onChange={onQuantityChange}
              disabled={busy || soldOut}
              size="sm"
            />
          </div>
          {priceChanged ? (
            <p className="text-xs text-muted-foreground">
              Unitário: <EthPrice value={item.unitPriceEth} previous={item.addedPriceEth} />
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={busy}
          aria-label={`Remover ${item.nft.name} do carrinho`}
          className="absolute top-2 right-2 inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-text-accent outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          data-testid="remove-item"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </li>
    )
  }

  return (
    <li
      className={`grid items-center gap-x-4 gap-y-3 rounded-lg bg-card p-3 sm:pr-4 ${CART_COLUMNS}`}
      data-testid="cart-item"
      data-cart-item-id={item.id}
      data-nft-id={item.nftId}
    >
      <div className="flex min-w-0 items-center gap-4">
        <Link
          to="/nft/$nftId"
          params={{ nftId: item.nftId }}
          className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={item.nft.name}
        >
          <img
            src={artworkThumb(item.nft.imageUrl)}
            alt=""
            width={70}
            height={70}
            loading="lazy"
            className="size-[70px] rounded-lg object-cover"
          />
        </Link>
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="truncate text-base leading-5 font-bold">
            <Link
              to="/nft/$nftId"
              params={{ nftId: item.nftId }}
              className="outline-none hover:text-text-accent focus-visible:underline"
            >
              {item.nft.name}
            </Link>
          </h3>
          <p className="text-[13px] leading-4 text-muted-foreground">
            ID do token: {tokenId(item.nftId)} · {item.edition.name}
          </p>
          {badges}
        </div>
      </div>

      <div className="col-start-1 flex items-center gap-4 sm:contents">
        <div className="text-base font-bold text-text-accent">
          <span className="text-xs font-normal text-muted-foreground sm:hidden">Preço </span>
          <EthPrice value={item.unitPriceEth} previous={item.addedPriceEth} className="gap-2" />
        </div>
        <QuantityStepper
          label={`quantidade de ${item.nft.name}`}
          value={item.quantity}
          min={1}
          max={max}
          onChange={onQuantityChange}
          disabled={busy || soldOut}
          size="sm"
        />
        <div className="text-base font-bold text-text-accent">
          <span className="text-xs font-normal text-muted-foreground sm:hidden">Total </span>
          <EthPrice value={item.lineTotalEth} />
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={busy}
        aria-label={`Remover ${item.nft.name} do carrinho`}
        className="col-start-2 row-start-1 inline-flex size-9 cursor-pointer items-center justify-center justify-self-end rounded-sm text-text-accent outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 sm:col-start-5"
        data-testid="remove-item"
      >
        <Trash2 className="size-5" aria-hidden="true" />
      </button>
    </li>
  )
}
