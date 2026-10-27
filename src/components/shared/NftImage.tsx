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
 * Responsive variants of an artwork. Figma exports are converted by scripts/figma-assets.py into
 * `<name>-sm.webp` (320), `<name>.webp` (640) and `<name>-lg.webp` (1024).
 */
export function artworkSrcSet(src: string): string | undefined {
  const match = /^(.*?)(-sm|-lg)?\.webp$/.exec(src)
  if (!match) return undefined
  const base = match[1]
  return `${base}-sm.webp 320w, ${base}.webp 640w, ${base}-lg.webp 1024w`
}

/** Smallest variant, for thumbnails (cart rows, order lines). */
export function artworkThumb(src: string): string {
  return src.replace(/(-sm|-lg)?\.webp$/, '-sm.webp')
}

/**
 * Square artwork image. Width/height are always set so the browser reserves space and the
 * layout does not shift while the file loads.
 */
export function NftImage({
  src,
  alt,
  className,
  priority = false,
  sizes = '(min-width: 1024px) 250px, (min-width: 640px) 45vw, 90vw',
  width = 640,
  height = 640,
}: NftImageProps) {
  const srcSet = artworkSrcSet(src)

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
      className={cn('aspect-square h-auto w-full rounded-art bg-muted object-cover', className)}
    />
  )
}
