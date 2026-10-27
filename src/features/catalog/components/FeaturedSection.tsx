import { useQuery } from '@tanstack/react-query'

import { ErrorState } from '@/components/shared/ErrorState'
import { NftCard, NftCardSkeleton } from '@/components/shared/NftCard'
import { SectionHeading } from '@/components/shared/SectionHeading'

import { featuredNftsQuery } from '../queries'

export function FeaturedSection() {
  const featured = useQuery(featuredNftsQuery())

  return (
    <section aria-labelledby="featured-title" className="container-page py-8">
      <SectionHeading
        id="featured-title"
        title="Destaques"
        description="Seleção da semana, escolhida pela comunidade."
      />
      {featured.isError ? (
        <ErrorState
          className="mt-6"
          error={featured.error}
          onRetry={() => void featured.refetch()}
          retrying={featured.isFetching}
        />
      ) : (
        <ul
          className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
          data-testid="featured-grid"
        >
          {featured.isPending
            ? Array.from({ length: 4 }).map((_, i) => (
                <li key={i}>
                  <NftCardSkeleton />
                </li>
              ))
            : featured.data.items.map((nft) => (
                <li key={nft.id}>
                  <NftCard
                    id={nft.id}
                    name={nft.name}
                    collection={nft.collection}
                    imageUrl={nft.imageUrl}
                    priceEth={nft.priceEth}
                    available={nft.available}
                    className="h-full"
                  />
                </li>
              ))}
        </ul>
      )}
    </section>
  )
}
