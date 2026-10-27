import { useState } from 'react'

import { NftImage } from '@/components/shared/NftImage'
import { cn } from '@/lib/utils'

interface NftGalleryProps {
  name: string
  images: string[]
}

/** Main artwork with selectable thumbnails. Thumbnails behave as a tab list for keyboard users. */
export function NftGallery({ name, images }: NftGalleryProps) {
  const [index, setIndex] = useState(0)
  const current = images[index] ?? images[0] ?? ''

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse" data-testid="nft-gallery">
      <div className="min-w-0 flex-1">
        <NftImage
          src={current}
          alt={`Arte do NFT ${name}, imagem ${index + 1} de ${images.length}`}
          priority
          sizes="(min-width: 1024px) 560px, 90vw"
          className="rounded-2xl border border-border"
        />
      </div>
      {images.length > 1 ? (
        <div
          role="tablist"
          aria-label="Imagens do NFT"
          aria-orientation="vertical"
          className="flex gap-2 sm:w-20 sm:flex-col"
        >
          {images.map((src, i) => (
            <button
              key={src}
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
                'size-16 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-20',
                i === index ? 'border-primary' : 'border-border hover:border-muted-foreground',
              )}
            >
              <img
                src={src}
                alt=""
                width={80}
                height={80}
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
