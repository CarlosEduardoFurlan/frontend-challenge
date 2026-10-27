import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { MobileSearchBar } from '@/components/shared/MobileChrome'
import { DESKTOP_QUERY, useMediaQuery } from '@/hooks/use-media-query'

import type { CatalogSearch } from '../search-params'
import { BlogSection } from './BlogSection'
import { CatalogSection } from './CatalogSection'
import { HomeHero } from './HomeHero'
import { PromoSection } from './PromoSection'

/**
 * Home page. Desktop follows "Desktop / Início" (2:2): hero, products, promos, blog. Mobile
 * follows "Mobile / Início" (14:5226): search field + filter button, hero card, tabs and the
 * two-column grid; the remaining sections keep the desktop order below the first screen.
 * Rendered by the `/` route and, on desktop, behind the login/register modal.
 */
export function HomePage({ search }: { search: CatalogSearch }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const navigate = useNavigate()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [query, setQuery] = useState(search.q ?? '')
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const wasOpen = useRef(false)

  useEffect(() => setQuery(search.q ?? ''), [search.q])

  // The sheet has no Radix trigger (its button lives in the search bar): restore focus by hand.
  useEffect(() => {
    if (filtersOpen) wasOpen.current = true
    else if (wasOpen.current) {
      wasOpen.current = false
      requestAnimationFrame(() => filterButtonRef.current?.focus())
    }
  }, [filtersOpen])

  function submitSearch(term: string) {
    const q = term.trim()
    void navigate({
      to: '/',
      search: (prev) => ({ ...prev, q: q || undefined, page: undefined }),
      hash: 'catalogo',
    })
  }

  return (
    <>
      {isDesktop ? null : (
        <MobileSearchBar
          ref={filterButtonRef}
          value={query}
          onChange={setQuery}
          onSubmit={submitSearch}
          onOpenFilters={() => setFiltersOpen(true)}
        />
      )}
      <HomeHero />
      <CatalogSection
        search={search}
        filtersOpen={filtersOpen}
        onFiltersOpenChange={setFiltersOpen}
      />
      <PromoSection />
      <BlogSection />
    </>
  )
}
