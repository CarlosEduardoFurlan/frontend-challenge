import { useEffect, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import type { CategoryFacet } from '@/types/api'

import {
  NFT_CATEGORIES,
  CATEGORY_LABELS,
  type NftCategory,
  type ResolvedCatalogSearch,
} from '../search-params'

export interface CatalogFiltersProps {
  search: ResolvedCatalogSearch
  facets: CategoryFacet[] | undefined
  priceRange: { min: string; max: string } | undefined
  onChange: (patch: Partial<ResolvedCatalogSearch>) => void
  onClear: () => void
  /** Called after any change on mobile so the sheet can close. */
  onApplied?: () => void
}

/**
 * Filter panel. Category/availability apply immediately; price range applies on submit so the
 * user can type both bounds before the list refreshes. Every change resets the page to 1 in
 * the parent handler.
 */
export function CatalogFilters({
  search,
  facets,
  priceRange,
  onChange,
  onClear,
  onApplied,
}: CatalogFiltersProps) {
  const [minPrice, setMinPrice] = useState(search.minPrice ?? '')
  const [maxPrice, setMaxPrice] = useState(search.maxPrice ?? '')
  const [priceError, setPriceError] = useState<string | null>(null)

  useEffect(() => {
    setMinPrice(search.minPrice ?? '')
    setMaxPrice(search.maxPrice ?? '')
  }, [search.minPrice, search.maxPrice])

  const activeCount =
    search.category.length +
    (search.minPrice || search.maxPrice ? 1 : 0) +
    (search.available ? 1 : 0)

  function toggleCategory(category: NftCategory, checked: boolean) {
    const next = checked
      ? [...search.category, category]
      : search.category.filter((c) => c !== category)
    onChange({ category: next })
    onApplied?.()
  }

  function submitPrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const min = minPrice.trim().replace(',', '.')
    const max = maxPrice.trim().replace(',', '.')
    const valid = /^\d*(\.\d+)?$/
    if ((min && !valid.test(min)) || (max && !valid.test(max))) {
      setPriceError('Use apenas números, por exemplo 0.5')
      return
    }
    if (min && max && Number(min) > Number(max)) {
      setPriceError('O mínimo não pode ser maior que o máximo.')
      return
    }
    setPriceError(null)
    onChange({ minPrice: min || undefined, maxPrice: max || undefined })
    onApplied?.()
  }

  return (
    <div className="flex flex-col gap-5" data-testid="catalog-filters">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm uppercase">Filtros</h3>
        {activeCount > 0 ? (
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              onClear()
              onApplied?.()
            }}
            data-testid="clear-filters"
          >
            Limpar ({activeCount})
          </Button>
        ) : null}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Categorias
        </legend>
        {NFT_CATEGORIES.map((category) => {
          const facet = facets?.find((f) => f.id === category)
          const id = `filter-category-${category}`
          return (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={id}
                checked={search.category.includes(category)}
                onCheckedChange={(checked) => toggleCategory(category, checked === true)}
                data-testid={`filter-category-${category}`}
              />
              <Label
                htmlFor={id}
                className="flex flex-1 cursor-pointer items-center justify-between font-normal"
              >
                <span>{CATEGORY_LABELS[category]}</span>
                {facets ? (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {facet?.count ?? 0}
                  </span>
                ) : (
                  <Skeleton className="h-3 w-5" />
                )}
              </Label>
            </div>
          )
        })}
      </fieldset>

      <Separator />

      <form
        onSubmit={submitPrice}
        className="flex flex-col gap-3"
        aria-labelledby="price-filter-title"
      >
        <h4
          id="price-filter-title"
          className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
        >
          Preço (ETH)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1">
            <Label htmlFor="filter-min-price" className="text-xs">
              Mínimo
            </Label>
            <Input
              id="filter-min-price"
              inputMode="decimal"
              placeholder={priceRange?.min ?? '0'}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              aria-invalid={priceError ? true : undefined}
              aria-describedby={priceError ? 'price-filter-error' : undefined}
              data-testid="filter-min-price"
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="filter-max-price" className="text-xs">
              Máximo
            </Label>
            <Input
              id="filter-max-price"
              inputMode="decimal"
              placeholder={priceRange?.max ?? '10'}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              aria-invalid={priceError ? true : undefined}
              aria-describedby={priceError ? 'price-filter-error' : undefined}
              data-testid="filter-max-price"
            />
          </div>
        </div>
        {priceError ? (
          <p id="price-filter-error" role="alert" className="text-xs text-destructive">
            {priceError}
          </p>
        ) : null}
        <Button type="submit" variant="secondary" size="sm" data-testid="apply-price">
          Aplicar preço
        </Button>
      </form>

      <Separator />

      <div className="flex items-center gap-2">
        <Checkbox
          id="filter-available"
          checked={search.available}
          onCheckedChange={(checked) => {
            onChange({ available: checked === true })
            onApplied?.()
          }}
          data-testid="filter-available"
        />
        <Label htmlFor="filter-available" className="cursor-pointer font-normal">
          Somente disponíveis
        </Label>
      </div>
    </div>
  )
}
