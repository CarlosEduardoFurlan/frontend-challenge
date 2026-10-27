import { Skeleton } from '@/components/ui/skeleton'

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
            <Skeleton key={i} className="size-16 rounded-lg sm:size-20" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-3/4" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
