import { Link } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'

import { EthPrice } from '@/components/shared/EthPrice'
import { QuantityStepper } from '@/components/shared/QuantityStepper'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CartItem } from '@/types/api'

interface CartItemRowProps {
  item: CartItem
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
  busy?: boolean
}

export function CartItemRow({ item, onQuantityChange, onRemove, busy }: CartItemRowProps) {
  const soldOut = item.available <= 0
  const max = Math.max(1, Math.min(item.available, item.maxPerOrder))
  const priceChanged = item.unitPriceEth !== item.addedPriceEth
  const overLimit = item.quantity > max && !soldOut

  return (
    <li
      className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto]"
      data-testid="cart-item"
      data-cart-item-id={item.id}
      data-nft-id={item.nftId}
    >
      <Link
        to="/nft/$nftId"
        params={{ nftId: item.nftId }}
        className="row-span-2 sm:row-span-1"
        aria-label={item.nft.name}
      >
        <img
          src={item.nft.imageUrl.replace(/-1\.webp$/, '-1-sm.webp')}
          alt=""
          width={88}
          height={88}
          loading="lazy"
          className="aspect-square w-full rounded-lg object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="truncate text-sm font-semibold">
          <Link to="/nft/$nftId" params={{ nftId: item.nftId }} className="hover:underline">
            {item.nft.name}
          </Link>
        </h3>
        <p className="text-xs text-muted-foreground">
          {item.nft.collection} · {item.edition.name}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <EthPrice value={item.unitPriceEth} previous={item.addedPriceEth} />
          <span className="text-xs text-muted-foreground">/ unidade</span>
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
      </div>

      <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end">
        <QuantityStepper
          label={`quantidade de ${item.nft.name}`}
          value={item.quantity}
          min={1}
          max={max}
          onChange={onQuantityChange}
          disabled={busy || soldOut}
          size="sm"
        />
        <div className="flex items-center gap-3">
          <EthPrice value={item.lineTotalEth} className="text-sm font-semibold text-text-accent" />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            disabled={busy}
            aria-label={`Remover ${item.nft.name} do carrinho`}
            data-testid="remove-item"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </div>
    </li>
  )
}
