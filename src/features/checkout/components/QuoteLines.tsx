import { EthPrice } from '@/components/shared/EthPrice'
import { artworkThumb } from '@/components/shared/NftImage'
import { Badge } from '@/components/ui/badge'
import { tokenId } from '@/lib/format'
import type { Quote, QuoteLine } from '@/types/api'

const STATUS_LABEL: Record<QuoteLine['status'], string | null> = {
  ok: null,
  price_changed: 'Preço atualizado',
  quantity_reduced: 'Quantidade reduzida',
  sold_out: 'Esgotado',
}

/**
 * Figma "Seus NFTs" (checkout frame): "NFTs | Subtotal" header over a hairline, then rows on
 * color/surface-card with a 64px thumbnail, bold name, token id, "(x N)" and the line total in
 * text-accent. Items are exactly as priced by the API.
 */
export function QuoteLines({ quote }: { quote: Quote }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="hairline flex justify-between pb-2 text-base font-bold" aria-hidden="true">
        <span>NFTs</span>
        <span>Subtotal</span>
      </div>
      <ul className="flex flex-col gap-2" data-testid="quote-lines">
        {quote.lines.map((line) => (
          <li
            key={line.cartItemId}
            className="flex items-center gap-3 rounded-lg bg-card p-2"
            data-testid="quote-line"
            data-status={line.status}
          >
            <img
              src={artworkThumb(line.imageUrl)}
              alt=""
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-lg object-cover"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base leading-5 font-bold">{line.name}</p>
              <p className="truncate text-[13px] leading-4 text-muted-foreground">
                ID do token: {tokenId(line.nftId)} · {line.editionName}
              </p>
              {STATUS_LABEL[line.status] ? (
                <Badge
                  variant={line.status === 'sold_out' ? 'destructive' : 'warning'}
                  className="mt-1"
                >
                  {STATUS_LABEL[line.status]}
                  {line.status === 'quantity_reduced'
                    ? ` (${line.requestedQuantity} → ${line.quantity})`
                    : ''}
                </Badge>
              ) : null}
            </div>
            <span className="text-sm whitespace-nowrap text-muted-foreground">
              (x {line.quantity})
            </span>
            <EthPrice value={line.lineTotalEth} className="text-lg font-bold text-text-accent" />
          </li>
        ))}
      </ul>
    </div>
  )
}
