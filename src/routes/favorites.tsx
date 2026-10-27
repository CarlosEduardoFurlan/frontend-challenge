import { createFileRoute, Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { NftCard, NftCardSkeleton } from '@/components/shared/NftCard'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Button } from '@/components/ui/button'
import { requireAuth } from '@/features/auth/require-auth'
import { FavoriteButton } from '@/features/favorites/components/FavoriteButton'
import { useFavorites } from '@/features/favorites/hooks'

export const Route = createFileRoute('/favorites')({
  beforeLoad: requireAuth,
  component: FavoritesPage,
})

function FavoritesPage() {
  const favorites = useFavorites()

  return (
    <section className="container-page py-8" aria-labelledby="favorites-title">
      <SectionHeading
        as="h1"
        id="favorites-title"
        title="Favoritos"
        description="Os NFTs que você marcou ficam salvos na sua conta."
      />
      <div className="mt-6">
        {favorites.isPending ? (
          <ul
            className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4"
            aria-busy="true"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i}>
                <NftCardSkeleton />
              </li>
            ))}
          </ul>
        ) : favorites.isError ? (
          <ErrorState
            error={favorites.error}
            onRetry={() => void favorites.refetch()}
            retrying={favorites.isFetching}
          />
        ) : favorites.data.items.length === 0 ? (
          <EmptyState
            icon={<Heart />}
            title="Nenhum favorito ainda"
            description="Toque no coração de um NFT para salvá-lo aqui."
            action={
              <Button asChild>
                <Link to="/" hash="catalogo">
                  Explorar catálogo
                </Link>
              </Button>
            }
          />
        ) : (
          <ul
            className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4"
            data-testid="favorites-grid"
          >
            {favorites.data.items.map((nft) => (
              <li key={nft.id}>
                <NftCard
                  id={nft.id}
                  name={nft.name}
                  collection={nft.collection}
                  imageUrl={nft.imageUrl}
                  priceEth={nft.priceEth}
                  available={nft.available}
                  favoriteSlot={<FavoriteButton nftId={nft.id} name={nft.name} summary={nft} />}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
