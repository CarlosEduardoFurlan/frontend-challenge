import { Skeleton } from '@/components/ui/skeleton'

/**
 * Mirrors the real detail layout block by block (breadcrumb, gallery with three thumbnails,
 * title, price row, description, edition chips, quantity row, metadata, share row and the
 * tabs block) so the footer does not move when the content replaces it.
 */
export function NftDetailSkeleton() {
  return (
    <div
      className="container-page pt-8"
      aria-busy="true"
      aria-label="Carregando NFT"
      data-testid="nft-detail-skeleton"
    >
      <Skeleton className="h-5 w-48" />
      <div className="mt-5 grid gap-8 lg:grid-cols-[568px_minmax(0,1fr)] lg:gap-[37px]">
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex gap-3 sm:w-[98px] sm:flex-col">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="size-[72px] shrink-0 rounded-lg sm:size-[98px]" />
            ))}
          </div>
          <div className="min-w-0 flex-1 rounded-lg bg-card p-4">
            <Skeleton className="aspect-square w-full rounded-art" />
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex justify-between">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-5 w-56" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-40 rounded-full" />
              <Skeleton className="h-7 w-40 rounded-full" />
            </div>
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-28" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-56" />
              <Skeleton className="size-10" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-5 w-56" />
        </div>
      </div>
      <div className="mt-20 flex flex-col gap-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
