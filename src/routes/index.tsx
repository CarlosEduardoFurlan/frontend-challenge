import { createFileRoute } from '@tanstack/react-router'

import { NftCardSkeleton } from '@/components/shared/NftCard'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Skeleton } from '@/components/ui/skeleton'
import { HomeHero } from '@/features/catalog/components/HomeHero'
import { catalogSearchSchema } from '@/features/catalog/search-params'

export const Route = createFileRoute('/')({
  validateSearch: catalogSearchSchema,
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <HomeHero />
      <section id="catalogo" aria-labelledby="catalog-title" className="container-page py-8">
        <SectionHeading
          id="catalog-title"
          title="Catálogo"
          description="Explore as coleções disponíveis."
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside aria-label="Filtros" className="hidden lg:block">
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
              <Skeleton className="h-4 w-24" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </aside>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <NftCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
