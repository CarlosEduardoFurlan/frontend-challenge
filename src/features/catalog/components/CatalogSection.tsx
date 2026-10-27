import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { SlidersHorizontal } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { announce } from '@/components/shared/LiveAnnouncer'
import { NftCard, NftCardSkeleton } from '@/components/shared/NftCard'
import { Pagination } from '@/components/shared/Pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { DESKTOP_QUERY, useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

import { nftListQuery, toListParams } from '../queries'
import {
  parseCatalogSearch,
  resolveCatalogSearch,
  SORT_LABELS,
  SORT_OPTIONS,
  type CatalogSearch,
  type ResolvedCatalogSearch,
  type SortOption,
} from '../search-params'
import { CatalogFilters } from './CatalogFilters'
import { FeaturedBanner } from './FeaturedBanner'

interface CatalogSectionProps {
  search: CatalogSearch
  renderCardBadge?: (nftId: string) => ReactNode
}

/** Figma toolbar tabs; each one is a sort preset ("Todos os NFTs" = relevance). */
const TABS: Array<{ label: string; sort: SortOption }> = [
  { label: 'Todos os NFTs', sort: 'relevance' },
  { label: 'Novos lançamentos', sort: 'newest' },
  { label: 'Em alta', sort: 'popular' },
]

/**
 * Figma "Products" (frame 70342:2831): 310px sidebar (Filters + Featured NFT Banner, 24px
 * apart) and the product grid 48px to the right: toolbar (tabs + "Ordenar por"), rows of three
 * 258px cards (34px column gap, 72px row gap) and the right-aligned pagination 88px below.
 */
export function CatalogSection({ search, renderCardBadge }: CatalogSectionProps) {
  const navigate = useNavigate()
  const resolved = resolveCatalogSearch(search)
  const params = toListParams(resolved)
  const list = useQuery(nftListQuery(params))
  const [filtersOpen, setFiltersOpen] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  /** Every filter change rewrites the URL and resets the page (unless the page itself changed). */
  const applySearch = useCallback(
    (patch: Partial<ResolvedCatalogSearch>, options?: { keepPage?: boolean }) => {
      void navigate({
        to: '/',
        hash: 'catalogo',
        replace: false,
        search: (prev) => {
          const next = { ...parseCatalogSearch(prev), ...normalisePatch(patch) }
          if (!options?.keepPage) delete next.page
          return next
        },
      })
    },
    [navigate],
  )

  /** Removes filters but keeps the search term and sort order. */
  const clearFilters = useCallback(() => {
    void navigate({ to: '/', hash: 'catalogo', search: (prev) => ({ q: prev.q, sort: prev.sort }) })
  }, [navigate])

  /** Resets the whole catalog state (used by the empty state). */
  const clearAll = useCallback(() => {
    void navigate({ to: '/', hash: 'catalogo', search: {} })
  }, [navigate])

  function changePage(page: number) {
    applySearch({ page }, { keepPage: true })
    resultsRef.current?.focus({ preventScroll: false })
  }

  // A page beyond the last one (stale link, filters narrowed the result) jumps to the last page.
  useEffect(() => {
    if (
      list.data &&
      !list.isPlaceholderData &&
      list.data.total > 0 &&
      resolved.page > list.data.totalPages
    ) {
      void navigate({
        to: '/',
        hash: 'catalogo',
        replace: true,
        search: (prev) => ({
          ...parseCatalogSearch(prev),
          page: list.data.totalPages > 1 ? list.data.totalPages : undefined,
        }),
      })
    }
  }, [list.data, list.isPlaceholderData, resolved.page, navigate])

  useEffect(() => {
    if (list.data && !list.isPlaceholderData) {
      announce(
        list.data.total === 0
          ? 'Nenhum NFT encontrado.'
          : `${list.data.total} NFTs encontrados, página ${list.data.page} de ${list.data.totalPages}.`,
      )
    }
  }, [list.data, list.isPlaceholderData])

  const data = list.data
  const showSkeleton = list.isPending
  const refreshing = list.isFetching && !list.isPending

  const filters = (
    <CatalogFilters
      search={resolved}
      facets={
        data ? { categories: data.facets.categories, networks: data.facets.networks } : undefined
      }
      priceRange={data?.facets.priceRange}
      onChange={(patch) => applySearch(patch)}
      onClear={clearFilters}
      onApplied={() => setFiltersOpen(false)}
    />
  )

  return (
    <section
      id="catalogo"
      aria-labelledby="catalog-title"
      className="container-page scroll-mt-24 pt-24"
    >
      <h2 id="catalog-title" className="sr-only">
        Catálogo
      </h2>

      <div className="grid gap-8 lg:grid-cols-[310px_minmax(0,1fr)] lg:gap-12">
        {isDesktop ? (
          <aside aria-label="Filtros" className="flex flex-col gap-6">
            {filters}
            <FeaturedBanner />
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div
              role="tablist"
              aria-label="Seleções do catálogo"
              className="flex gap-5 overflow-x-auto text-[15px] leading-4 font-medium"
            >
              {TABS.map((tab) => {
                const active = resolved.sort === tab.sort
                return (
                  <button
                    key={tab.sort}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => applySearch({ sort: tab.sort })}
                    className={cn(
                      'relative shrink-0 cursor-pointer pb-[7px] whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                      active
                        ? 'text-text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary'
                        : 'text-foreground hover:text-text-accent',
                    )}
                    data-testid={`catalog-tab-${tab.sort}`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 pb-[5px] text-[15px] leading-none">
                <Label htmlFor="catalog-sort" className="text-[15px] whitespace-nowrap">
                  Ordenar por:
                </Label>
                <NativeSelect
                  id="catalog-sort"
                  appearance="inline"
                  value={resolved.sort}
                  onChange={(e) => applySearch({ sort: e.target.value as SortOption })}
                  data-testid="catalog-sort"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {SORT_LABELS[option]}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              {isDesktop ? null : (
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="open-filters">
                      <SlidersHorizontal aria-hidden="true" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="max-h-[85dvh] p-0">
                    <SheetHeader className="px-5 pt-5">
                      <SheetTitle>Filtros</SheetTitle>
                      <SheetDescription>Refine os resultados do catálogo.</SheetDescription>
                    </SheetHeader>
                    {filters}
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>

          <div
            ref={resultsRef}
            tabIndex={-1}
            className="mt-3 flex min-h-5 items-center justify-between gap-3 text-xs text-brass outline-none"
            aria-live="off"
          >
            <p data-testid="catalog-count">
              {data ? `${data.total} resultado${data.total === 1 ? '' : 's'}` : ' '}
            </p>
            {refreshing ? (
              <Badge variant="muted" data-testid="catalog-refreshing">
                Atualizando…
              </Badge>
            ) : null}
          </div>

          {list.isError && !data ? (
            <ErrorState
              className="mt-6"
              error={list.error}
              onRetry={() => void list.refetch()}
              retrying={list.isFetching}
            />
          ) : showSkeleton ? (
            <div
              className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:gap-x-[34px] lg:gap-y-[72px]"
              aria-busy="true"
              aria-label="Carregando catálogo"
            >
              {Array.from({ length: resolved.pageSize }).map((_, i) => (
                <NftCardSkeleton key={i} />
              ))}
            </div>
          ) : data && data.items.length === 0 ? (
            <EmptyState
              className="mt-6"
              title="Nenhum NFT encontrado"
              description="Tente outros termos ou remova alguns filtros."
              action={
                <Button variant="outline" onClick={clearAll}>
                  Limpar filtros
                </Button>
              }
            />
          ) : data ? (
            <>
              <ul
                className={cn(
                  'mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:gap-x-[34px] lg:gap-y-[72px]',
                  refreshing && 'opacity-80',
                )}
                data-testid="catalog-grid"
                aria-busy={refreshing || undefined}
              >
                {data.items.map((nft, index) => (
                  <li key={nft.id}>
                    <NftCard
                      id={nft.id}
                      name={nft.name}
                      collection={nft.collection}
                      imageUrl={nft.imageUrl}
                      priceEth={nft.priceEth}
                      available={nft.available}
                      priority={index < 3}
                      badge={renderCardBadge?.(nft.id)}
                      favoriteSlot={<FavoriteButton nftId={nft.id} name={nft.name} summary={nft} />}
                      className="h-full"
                    />
                  </li>
                ))}
              </ul>
              {list.isError ? (
                <p role="alert" className="mt-4 text-xs text-destructive">
                  Não foi possível atualizar a lista. Exibindo o último resultado carregado.
                </p>
              ) : null}
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onPageChange={changePage}
                className="mt-12 lg:mt-[88px]"
              />
            </>
          ) : null}

          {isDesktop ? null : (
            <div className="mt-10">
              <FeaturedBanner />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function normalisePatch(patch: Partial<ResolvedCatalogSearch>): Partial<CatalogSearch> {
  const next: Partial<CatalogSearch> = {}
  if ('q' in patch) next.q = patch.q || undefined
  if ('category' in patch) next.category = patch.category?.length ? patch.category : undefined
  if ('network' in patch) next.network = patch.network?.length ? patch.network : undefined
  if ('minPrice' in patch) next.minPrice = patch.minPrice || undefined
  if ('maxPrice' in patch) next.maxPrice = patch.maxPrice || undefined
  if ('available' in patch) next.available = patch.available ? true : undefined
  if ('sort' in patch) next.sort = patch.sort === 'relevance' ? undefined : patch.sort
  if ('page' in patch) next.page = patch.page && patch.page > 1 ? patch.page : undefined
  return next
}
