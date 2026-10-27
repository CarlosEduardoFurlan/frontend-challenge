import { Skeleton } from '@/components/ui/skeleton'

/**
 * Mirrors the real detail layout block by block (badges, title, creator, description,
 * two edition rows, quantity row, actions, six trait boxes) so the footer does not move
 * when the content replaces it.
 */
export function NftDetailSkeleton() {
  return (
    <div
      className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
      aria-busy="true"
      aria-label="Carregando NFT"
      data-testid="nft-detail-skeleton"
    >
      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="flex gap-2 sm:w-20 sm:flex-col">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="size-16 shrink-0 rounded-lg sm:size-20" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-32 rounded-full" />
          </div>
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-[62px] w-full rounded-lg" />
          <Skeleton className="h-[62px] w-full rounded-lg" />
        </div>
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
        <Skeleton className="h-px w-full" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[66px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
