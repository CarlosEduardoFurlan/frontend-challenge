import { createFileRoute } from '@tanstack/react-router'

import { HomePage } from '@/features/catalog/components/HomePage'
import { parseCatalogSearch } from '@/features/catalog/search-params'

export const Route = createFileRoute('/')({
  validateSearch: parseCatalogSearch,
  component: HomeRoute,
})

function HomeRoute() {
  const search = Route.useSearch()
  return <HomePage search={search} />
}
