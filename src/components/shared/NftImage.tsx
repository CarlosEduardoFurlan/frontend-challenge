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
  /**
   * Offers the 1024px variant to desktop viewports only (hero, detail): phones get at most the
   * 640px file, which keeps the LCP download small on slow connections.
   */
  large?: boolean
}

/**
 * Responsive variants of an artwork. Figma exports are converted by scripts/figma-assets.py into
 * `<name>-sm.webp` (320), `<name>.webp` (640) and `<name>-lg.webp` (1024).
 */
export function artworkSrcSet(src: string, options?: { large?: boolean }): string | undefined {
  const match = /^(.*?)(-sm|-lg)?\.webp$/.exec(src)
  if (!match) return undefined
  const base = match[1]
  const candidates = `${base}-sm.webp 320w, ${base}.webp 640w`
  return options?.large ? `${candidates}, ${base}-lg.webp 1024w` : candidates
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
  large = false,
}: NftImageProps) {
  const srcSet = artworkSrcSet(src)
  const image = (
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
  if (!large || !srcSet) return image
  return (
    <picture>
      <source
        media="(min-width: 1024px)"
        srcSet={artworkSrcSet(src, { large: true })}
        sizes={sizes}
      />
      {image}
    </picture>
  )
}
