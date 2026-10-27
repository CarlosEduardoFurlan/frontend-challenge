import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { SlidersHorizontal } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { announce } from '@/components/shared/LiveAnnouncer'
import { NftCard, NftCardSkeleton } from '@/components/shared/NftCard'
import { Pagination } from '@/components/shared/Pagination'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  catalogSearchSchema,
  resolveCatalogSearch,
  SORT_LABELS,
  SORT_OPTIONS,
  type CatalogSearch,
  type ResolvedCatalogSearch,
  type SortOption,
} from '../search-params'
import { CatalogFilters } from './CatalogFilters'

interface CatalogSectionProps {
  search: CatalogSearch
  renderCardBadge?: (nftId: string) => ReactNode
}

export function CatalogSection({ search, renderCardBadge }: CatalogSectionProps) {
  const navigate = useNavigate()
  const resolved = resolveCatalogSearch(search)
  const params = toListParams(resolved)
  const list = useQuery(nftListQuery(params))
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [queryDraft, setQueryDraft] = useState(resolved.q)
  const resultsRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  useEffect(() => setQueryDraft(resolved.q), [resolved.q])

  /** Every filter change rewrites the URL and resets the page (unless the page itself changed). */
  const applySearch = useCallback(
    (patch: Partial<ResolvedCatalogSearch>, options?: { keepPage?: boolean }) => {
      void navigate({
        to: '/',
        hash: 'catalogo',
        replace: false,
        search: (prev) => {
          const next = { ...catalogSearchSchema.parse(prev), ...normalisePatch(patch) }
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

  function submitQuery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    applySearch({ q: queryDraft.trim() })
  }

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
          ...catalogSearchSchema.parse(prev),
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
      facets={data?.facets.categories}
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
      className="container-page scroll-mt-20 py-8"
    >
      <SectionHeading
        id="catalog-title"
        title="Catálogo"
        description="Busque, filtre e ordene as edições disponíveis."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        {isDesktop ? (
          <aside aria-label="Filtros">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-4">
              {filters}
            </div>
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <form role="search" onSubmit={submitQuery} className="flex flex-1 gap-2">
              <div className="grid flex-1 gap-1">
                <Label htmlFor="catalog-search" className="text-xs">
                  Buscar
                </Label>
                <Input
                  id="catalog-search"
                  type="search"
                  placeholder="Nome, coleção ou artista"
                  value={queryDraft}
                  onChange={(e) => setQueryDraft(e.target.value)}
                  data-testid="catalog-search"
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                className="self-end"
                data-testid="catalog-search-submit"
              >
                Buscar
              </Button>
            </form>

            <div className="grid gap-1 sm:w-48">
              <Label htmlFor="catalog-sort" className="text-xs">
                Ordenar por
              </Label>
              <NativeSelect
                id="catalog-sort"
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
                  <Button variant="outline" data-testid="open-filters">
                    <SlidersHorizontal aria-hidden="true" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85dvh]">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                    <SheetDescription>Refine os resultados do catálogo.</SheetDescription>
                  </SheetHeader>
                  {filters}
                </SheetContent>
              </Sheet>
            )}
          </div>

          <div
            ref={resultsRef}
            tabIndex={-1}
            className="flex min-h-6 items-center justify-between gap-3 text-sm text-muted-foreground outline-none"
            aria-live="off"
          >
            <p data-testid="catalog-count">
              {data ? `${data.total} resultado${data.total === 1 ? '' : 's'}` : ' '}
            </p>
            {refreshing ? (
              <Badge variant="muted" data-testid="catalog-refreshing">
                Atualizando…
              </Badge>
            ) : null}
          </div>

          {list.isError && !data ? (
            <ErrorState
              error={list.error}
              onRetry={() => void list.refetch()}
              retrying={list.isFetching}
            />
          ) : showSkeleton ? (
            <div
              className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3"
              aria-busy="true"
              aria-label="Carregando catálogo"
            >
              {Array.from({ length: resolved.pageSize }).map((_, i) => (
                <NftCardSkeleton key={i} />
              ))}
            </div>
          ) : data && data.items.length === 0 ? (
            <EmptyState
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
                  'grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3',
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
                <p role="alert" className="text-xs text-destructive">
                  Não foi possível atualizar a lista. Exibindo o último resultado carregado.
                </p>
              ) : null}
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                onPageChange={changePage}
                className="mt-4"
              />
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function normalisePatch(patch: Partial<ResolvedCatalogSearch>): Partial<CatalogSearch> {
  const next: Partial<CatalogSearch> = {}
  if ('q' in patch) next.q = patch.q || undefined
  if ('category' in patch) next.category = patch.category?.length ? patch.category : undefined
  if ('minPrice' in patch) next.minPrice = patch.minPrice || undefined
  if ('maxPrice' in patch) next.maxPrice = patch.maxPrice || undefined
  if ('available' in patch) next.available = patch.available ? true : undefined
  if ('sort' in patch) next.sort = patch.sort === 'relevance' ? undefined : patch.sort
  if ('page' in patch) next.page = patch.page && patch.page > 1 ? patch.page : undefined
  return next
}
