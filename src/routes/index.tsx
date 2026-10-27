import { createFileRoute } from '@tanstack/react-router'

import { BlogSection } from '@/features/catalog/components/BlogSection'
import { CatalogSection } from '@/features/catalog/components/CatalogSection'
import { HomeHero } from '@/features/catalog/components/HomeHero'
import { PromoSection } from '@/features/catalog/components/PromoSection'
import { parseCatalogSearch } from '@/features/catalog/search-params'

export const Route = createFileRoute('/')({
  validateSearch: parseCatalogSearch,
  component: HomePage,
})

/** Figma "Desktop / Início": Top (header + hero), Products, Promos, Blog, Footer. */
function HomePage() {
  const search = Route.useSearch()
  return (
    <>
      <HomeHero />
      <CatalogSection search={search} />
      <PromoSection />
      <BlogSection />
    </>
  )
}
