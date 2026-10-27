import { useQuery } from '@tanstack/react-query'

import { NftCard, NftCardSkeleton } from '@/components/shared/NftCard'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { nftListQuery } from '@/features/catalog/queries'
import type { Nft } from '@/types/api'

export function RelatedNfts({ nft }: { nft: Nft }) {
  const related = useQuery(nftListQuery({ category: [nft.category], pageSize: 5, sort: 'popular' }))
  const items = related.data?.items.filter((item) => item.id !== nft.id).slice(0, 4) ?? []

  if (related.isError || (related.data && items.length === 0)) return null

  return (
    <section aria-labelledby="related-title" className="container-page py-8">
      <SectionHeading
        id="related-title"
        title="Relacionados"
        description="Outras obras da mesma categoria."
      />
      <ul
        className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
        data-testid="related-grid"
      >
        {related.isPending
          ? Array.from({ length: 4 }).map((_, i) => (
              <li key={i}>
                <NftCardSkeleton />
              </li>
            ))
          : items.map((item) => (
              <li key={item.id}>
                <NftCard
                  id={item.id}
                  name={item.name}
                  collection={item.collection}
                  imageUrl={item.imageUrl}
                  priceEth={item.priceEth}
                  available={item.available}
                  className="h-full"
                />
              </li>
            ))}
      </ul>
    </section>
  )
}
