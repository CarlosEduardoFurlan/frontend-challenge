import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { nftDetailQuery } from '@/features/catalog/queries'
import { NftDetail } from '@/features/nft/components/NftDetail'
import { NftDetailSkeleton } from '@/features/nft/components/NftDetailSkeleton'
import { RelatedNfts } from '@/features/nft/components/RelatedNfts'
import { isApiError } from '@/services/api/errors'

export const Route = createFileRoute('/nft/$nftId')({
  component: NftDetailPage,
})

function NftDetailPage() {
  const { nftId } = Route.useParams()
  const detail = useQuery(nftDetailQuery(nftId))

  if (detail.isPending) {
    return (
      <div className="container-page py-8">
        <NftDetailSkeleton />
      </div>
    )
  }

  if (detail.isError) {
    const notFound = isApiError(detail.error) && detail.error.status === 404
    return (
      <div className="container-page py-16">
        {notFound ? (
          <EmptyState
            title="NFT não encontrado"
            description="O identificador informado não existe ou o item foi removido do catálogo."
            action={
              <Button asChild>
                <Link to="/">Voltar ao catálogo</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState
            error={detail.error}
            onRetry={() => void detail.refetch()}
            retrying={detail.isFetching}
          />
        )}
      </div>
    )
  }

  return (
    <>
      <NftDetail nft={detail.data} />
      <RelatedNfts nft={detail.data} />
    </>
  )
}
