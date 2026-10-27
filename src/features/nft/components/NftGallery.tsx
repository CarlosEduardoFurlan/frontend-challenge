import { useState } from 'react'

import { NftImage } from '@/components/shared/NftImage'
import { cn } from '@/lib/utils'

interface NftGalleryProps {
  name: string
  images: string[]
}

/**
 * Figma detail gallery: a column of 98px thumbnails on the left and the main artwork inside a
 * 440px color/surface-card box (artwork 15px radius, 16px inset) with a zoom affordance in the
 * top-right corner. Thumbnails behave as a tab list for keyboard users.
 */
export function NftGallery({ name, images }: NftGalleryProps) {
  const [index, setIndex] = useState(0)
  const current = images[index] ?? images[0] ?? ''

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row" data-testid="nft-gallery">
      {images.length > 1 ? (
        <div
          role="tablist"
          aria-label="Imagens do NFT"
          aria-orientation="vertical"
          className="flex gap-3 sm:w-[98px] sm:flex-col"
        >
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Imagem ${i + 1}`}
              tabIndex={i === index ? 0 : -1}
              onClick={() => setIndex(i)}
              onKeyDown={(event) => {
                const delta =
                  event.key === 'ArrowDown' || event.key === 'ArrowRight'
                    ? 1
                    : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
                      ? -1
                      : 0
                if (!delta) return
                event.preventDefault()
                const next = (index + delta + images.length) % images.length
                setIndex(next)
                ;(
                  event.currentTarget.parentElement?.children[next] as HTMLElement | undefined
                )?.focus()
              }}
              className={cn(
                'flex size-[72px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-card p-1 ring-2 transition-colors outline-none focus-visible:ring-ring sm:size-[98px] sm:p-2',
                i === index ? 'ring-primary' : 'ring-transparent hover:ring-border-soft',
              )}
            >
              <img
                src={src.replace(/(-sm|-lg)?\.webp$/, '-sm.webp')}
                alt=""
                width={82}
                height={82}
                loading="lazy"
                className="size-full rounded-[10px] object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
      <div className="relative min-w-0 flex-1 rounded-lg bg-card p-4">
        <NftImage
          src={current}
          alt={`Arte do NFT ${name}, imagem ${index + 1} de ${images.length}`}
          priority
          sizes="(min-width: 1024px) 408px, 90vw"
          className="rounded-art"
        />
        <a
          href={current.replace(/(-sm|-lg)?\.webp$/, '-lg.webp')}
          target="_blank"
          rel="noreferrer"
          className="absolute top-4 right-4 inline-flex size-7 items-center justify-center rounded-full border-2 border-primary text-primary outline-none hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Abrir a arte em tamanho grande em nova aba"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M9.5 9.5L13 13"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </a>
      </div>
    </div>
  )
}
