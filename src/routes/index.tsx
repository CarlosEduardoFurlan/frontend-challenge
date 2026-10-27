import { createFileRoute } from '@tanstack/react-router'

import { CatalogSection } from '@/features/catalog/components/CatalogSection'
import { FeaturedSection } from '@/features/catalog/components/FeaturedSection'
import { HomeHero } from '@/features/catalog/components/HomeHero'
import { catalogSearchSchema } from '@/features/catalog/search-params'

export const Route = createFileRoute('/')({
  validateSearch: catalogSearchSchema,
  component: HomePage,
})

function HomePage() {
  const search = Route.useSearch()
  return (
    <>
      <HomeHero />
      <FeaturedSection />
      <CatalogSection search={search} />
    </>
  )
}
