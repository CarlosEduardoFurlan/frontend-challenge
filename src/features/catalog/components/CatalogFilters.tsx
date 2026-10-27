import { useEffect, useMemo, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { NETWORKS } from '@/mocks/fixtures/networks'
import { cn } from '@/lib/utils'
import type { CategoryFacet, NetworkFacet } from '@/types/api'

import {
  NFT_CATEGORIES,
  NFT_NETWORKS,
  CATEGORY_LABELS,
  type NftCategory,
  type NftNetwork,
  type ResolvedCatalogSearch,
} from '../search-params'

export interface CatalogFiltersProps {
  search: ResolvedCatalogSearch
  facets: { categories: CategoryFacet[]; networks: NetworkFacet[] } | undefined
  priceRange: { min: string; max: string } | undefined
  onChange: (patch: Partial<ResolvedCatalogSearch>) => void
  onClear: () => void
  /** Called after any change on mobile so the sheet can close. */
  onApplied?: () => void
}

/**
 * Figma "Filters" (component 70485:381, 310 wide, surface-card, 20px padding, 40px between
 * groups): "Coleções" and "Rede" are lists of 40px rows (15px text, count in bold on the
 * right) where the selected entries are highlighted in text-accent; "Faixa de preço" is a
 * range slider with the "Preço: min - max ETH" line and the "Aplicar" button.
 * Category, network and availability apply immediately; the price range applies on submit.
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

  const bounds = useMemo(
    () => ({ min: Number(priceRange?.min ?? '0'), max: Number(priceRange?.max ?? '10') }),
    [priceRange],
  )
  const sliderValue = [
    clampNumber(minPrice, bounds.min, bounds),
    clampNumber(maxPrice, bounds.max, bounds),
  ]

  const activeCount =
    search.category.length +
    search.network.length +
    (search.minPrice || search.maxPrice ? 1 : 0) +
    (search.available ? 1 : 0)

  function toggleCategory(category: NftCategory) {
    const checked = !search.category.includes(category)
    const next = checked
      ? [...search.category, category]
      : search.category.filter((c) => c !== category)
    onChange({ category: next })
    onApplied?.()
  }

  function toggleNetwork(network: NftNetwork) {
    const checked = !search.network.includes(network)
    const next = checked
      ? [...search.network, network]
      : search.network.filter((n) => n !== network)
    onChange({ network: next })
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
    <div className="flex flex-col gap-10 bg-card p-5" data-testid="catalog-filters">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 flex w-full items-center justify-between text-lg leading-4 font-bold">
          Coleções
          {activeCount > 0 ? (
            <button
              type="button"
              className="cursor-pointer text-xs font-bold text-text-accent underline-offset-4 hover:underline"
              onClick={() => {
                onClear()
                onApplied?.()
              }}
              data-testid="clear-filters"
            >
              Limpar ({activeCount})
            </button>
          ) : null}
        </legend>
        <ul className="px-3">
          {NFT_CATEGORIES.map((category) => {
            const facet = facets?.categories.find((f) => f.id === category)
            const checked = search.category.includes(category)
            return (
              <li key={category}>
                <FilterRow
                  label={CATEGORY_LABELS[category]}
                  count={facet?.count}
                  loading={!facets}
                  checked={checked}
                  onToggle={() => toggleCategory(category)}
                  testId={`filter-category-${category}`}
                />
              </li>
            )
          })}
        </ul>
      </fieldset>

      <form
        onSubmit={submitPrice}
        className="flex flex-col gap-3"
        aria-labelledby="price-filter-title"
      >
        <h3 id="price-filter-title" className="text-lg leading-4 font-bold">
          Faixa de preço
        </h3>
        <div className="flex flex-col gap-3 pl-3">
          <Slider
            min={bounds.min}
            max={bounds.max}
            step={0.01}
            value={sliderValue}
            minStepsBetweenThumbs={1}
            thumbLabels={['Preço mínimo', 'Preço máximo']}
            onValueChange={([min, max]) => {
              if (min !== undefined) setMinPrice(min === bounds.min ? '' : String(min))
              if (max !== undefined) setMaxPrice(max === bounds.max ? '' : String(max))
            }}
            className="w-full max-w-[216px]"
          />
          <p className="flex flex-wrap items-center gap-x-1 text-[15px] leading-none">
            <span>Preço:</span>
            <label htmlFor="filter-min-price" className="sr-only">
              Preço mínimo em ETH
            </label>
            <input
              id="filter-min-price"
              inputMode="decimal"
              placeholder={priceRange?.min ?? '0'}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              aria-invalid={priceError ? true : undefined}
              aria-describedby={priceError ? 'price-filter-error' : undefined}
              className="w-14 rounded-sm border-b border-border-soft bg-transparent text-center outline-none placeholder:text-brass focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
              data-testid="filter-min-price"
            />
            <span aria-hidden="true">-</span>
            <label htmlFor="filter-max-price" className="sr-only">
              Preço máximo em ETH
            </label>
            <input
              id="filter-max-price"
              inputMode="decimal"
              placeholder={priceRange?.max ?? '10'}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              aria-invalid={priceError ? true : undefined}
              aria-describedby={priceError ? 'price-filter-error' : undefined}
              className="w-14 rounded-sm border-b border-border-soft bg-transparent text-center outline-none placeholder:text-brass focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
              data-testid="filter-max-price"
            />
            <span>ETH</span>
          </p>
          {priceError ? (
            <p id="price-filter-error" role="alert" className="text-xs text-destructive">
              {priceError}
            </p>
          ) : null}
          <Button
            type="submit"
            size="sm"
            className="w-fit px-3 leading-5"
            data-testid="apply-price"
          >
            Aplicar
          </Button>
        </div>
      </form>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-lg leading-4 font-bold">Rede</legend>
        <ul className="pl-3">
          {NFT_NETWORKS.map((network) => {
            const facet = facets?.networks.find((f) => f.id === network)
            return (
              <li key={network}>
                <FilterRow
                  label={NETWORKS[network].label}
                  count={facet?.count}
                  loading={!facets}
                  checked={search.network.includes(network)}
                  onToggle={() => toggleNetwork(network)}
                  testId={`filter-network-${network}`}
                />
              </li>
            )
          })}
        </ul>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-lg leading-4 font-bold">Disponibilidade</legend>
        <ul className="pl-3">
          <li>
            <FilterRow
              label="Somente disponíveis"
              checked={search.available}
              onToggle={() => {
                onChange({ available: !search.available })
                onApplied?.()
              }}
              testId="filter-available"
            />
          </li>
        </ul>
      </fieldset>
    </div>
  )
}

interface FilterRowProps {
  label: string
  count?: number
  loading?: boolean
  checked: boolean
  onToggle: () => void
  testId: string
}

/** 40px row acting as a checkbox: label on the left, count in bold on the right. */
function FilterRow({ label, count, loading, checked, onToggle, testId }: FilterRowProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        'flex h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-sm text-[15px] leading-10 transition-colors outline-none hover:text-text-accent focus-visible:ring-2 focus-visible:ring-ring/60',
        checked ? 'text-text-accent' : 'text-muted-foreground',
      )}
      data-testid={testId}
    >
      <span className="truncate">{label}</span>
      {loading ? (
        <Skeleton className="h-3 w-7" />
      ) : count !== undefined ? (
        <span className="font-bold tabular-nums">({count})</span>
      ) : null}
    </button>
  )
}

function clampNumber(raw: string, fallback: number, bounds: { min: number; max: number }) {
  const value = Number(raw.replace(',', '.'))
  if (!raw.trim() || Number.isNaN(value)) return fallback
  return Math.min(bounds.max, Math.max(bounds.min, value))
}
