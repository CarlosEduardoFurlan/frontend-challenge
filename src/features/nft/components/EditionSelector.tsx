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

/**
 * Figma "Edição:" row: a bold label followed by outlined chips, the selected one in primary.
 * Each chip is a real radio (visually hidden) so the group stays keyboard operable.
 */
export function EditionSelector({ editions, value, onChange }: EditionSelectorProps) {
  const selected = editions.find((edition) => edition.id === value)

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-[15px] leading-none font-bold">Edição:</legend>
      <RadioGroup
        value={value ?? ''}
        onValueChange={onChange}
        aria-label="Edição"
        className="flex flex-wrap gap-2"
        data-testid="edition-selector"
      >
        {editions.map((edition) => {
          const soldOut = edition.available <= 0
          const id = `edition-${edition.id}`
          const active = edition.id === value
          return (
            <Label
              key={edition.id}
              htmlFor={id}
              className={cn(
                'inline-flex h-7 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs leading-none transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                active
                  ? 'border-primary font-bold text-text-accent'
                  : 'border-brass text-foreground hover:border-primary',
                soldOut && 'cursor-not-allowed opacity-60',
              )}
              data-testid={`edition-${edition.id}`}
            >
              <RadioGroupItem id={id} value={edition.id} disabled={soldOut} className="sr-only" />
              <span>{edition.name}</span>
              <span className="font-normal text-muted-foreground">·</span>
              {soldOut ? (
                <span className="font-normal text-muted-foreground">Esgotada</span>
              ) : (
                <EthPrice value={edition.priceEth} className="gap-1 font-normal" />
              )}
            </Label>
          )
        })}
      </RadioGroup>
      {selected ? (
        <p className="text-xs text-muted-foreground" data-testid="edition-availability">
          {selected.available <= 0
            ? 'Edição esgotada'
            : `${selected.available} de ${selected.total} disponíveis · até ${selected.maxPerOrder} por pedido`}
        </p>
      ) : null}
    </fieldset>
  )
}
