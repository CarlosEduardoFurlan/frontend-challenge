import { EthPrice } from '@/components/shared/EthPrice'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import type { NftEdition } from '@/types/api'

interface EditionSelectorProps {
  editions: NftEdition[]
  value: string | null
  onChange: (editionId: string) => void
}

export function EditionSelector({ editions, value, onChange }: EditionSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">Edição</legend>
      <RadioGroup
        value={value ?? ''}
        onValueChange={onChange}
        aria-label="Edição"
        data-testid="edition-selector"
      >
        {editions.map((edition) => {
          const soldOut = edition.available <= 0
          const id = `edition-${edition.id}`
          return (
            <Label
              key={edition.id}
              htmlFor={id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-3 font-normal transition-colors has-[[data-state=checked]]:border-primary',
                soldOut && 'cursor-not-allowed opacity-60',
              )}
              data-testid={`edition-${edition.id}`}
            >
              <RadioGroupItem id={id} value={edition.id} disabled={soldOut} />
              <span className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{edition.name}</span>
                <span className="text-xs text-muted-foreground" data-testid="edition-availability">
                  {soldOut
                    ? 'Esgotada'
                    : `${edition.available} de ${edition.total} disponíveis · até ${edition.maxPerOrder} por pedido`}
                </span>
              </span>
              <EthPrice value={edition.priceEth} className="text-sm font-semibold text-primary" />
            </Label>
          )
        })}
      </RadioGroup>
    </fieldset>
  )
}
