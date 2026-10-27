import { cn } from '@/lib/utils'

interface NftImageProps {
  src: string
  alt: string
  className?: string
  /** `eager` for above-the-fold images (hero, detail main image). */
  priority?: boolean
  sizes?: string
  width?: number
  height?: number
}

/**
 * Square artwork image. Width/height are always set so the browser reserves space and the
 * layout does not shift while the file loads. Catalog images come with a 320px variant.
 */
export function NftImage({
  src,
  alt,
  className,
  priority = false,
  sizes = '(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw',
  width = 640,
  height = 640,
}: NftImageProps) {
  const small = src.replace(/-1\.webp$/, '-1-sm.webp')
  const srcSet = small !== src ? `${small} 320w, ${src} 640w` : undefined

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={cn('aspect-square h-auto w-full rounded-lg bg-muted object-cover', className)}
    />
  )
}
