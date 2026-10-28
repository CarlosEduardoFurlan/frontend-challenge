import { useQuery } from '@tanstack/react-query'

import { NftCard, NftCardSkeleton } from '@/components/shared/NftCard'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { nftListQuery } from '@/features/catalog/queries'
import type { NftCategory } from '@/features/catalog/search-params'

interface RelatedNftsProps {
  /** Category to pull from (detail: the NFT's category; cart: the first item's category). */
  category?: NftCategory
  /** NFTs already on screen, removed from the row. */
  excludeIds?: string[]
  /** Figma titles: "Mais desta coleção" (detail) and "Colecionadores também viram" (cart). */
  title?: string
  testId?: string
}

/** Figma related row: section title (16 bold, text-accent) over a hairline and five cards. */
export function RelatedNfts({
  category,
  excludeIds = [],
  title = 'Mais desta coleção',
  testId = 'related-grid',
}: RelatedNftsProps) {
  const related = useQuery(
    nftListQuery({
      category: category ? [category] : undefined,
      pageSize: 5 + excludeIds.length,
      sort: 'popular',
    }),
  )
  const items =
    related.data?.items.filter((item) => !excludeIds.includes(item.id)).slice(0, 5) ?? []

  if (related.isError || (related.data && items.length === 0)) return null

  return (
    <section aria-labelledby={`${testId}-title`} className="container-page pt-20">
      <h2 id={`${testId}-title`} className="section-title hairline pb-3">
        {title}
      </h2>
      <ul
        className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-6"
        data-testid={testId}
      >
        {related.isPending
          ? Array.from({ length: 5 }).map((_, i) => (
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
                  favoriteSlot={<FavoriteButton nftId={item.id} name={item.name} summary={item} />}
                  className="h-full"
                />
              </li>
            ))}
      </ul>
    </section>
  )
}
