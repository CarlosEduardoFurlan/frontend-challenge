import { Link } from '@tanstack/react-router'
import { useLayoutEffect, useRef, useState } from 'react'

import { NftImage, artworkThumb } from '@/components/shared/NftImage'
import { adoptPrerenderedImage, prerenderedImage } from '@/lib/prerender'

/** Artwork of the hero in the Figma file ("Frame 136", the Emerald Ape, exported as ape-emerald). */
export const HERO_ARTWORK = '/assets/nfts/ape-emerald.webp'
/** Secondary thumbnail overlapping the hero artwork on the mobile frame (the Sage ape). */
const HERO_THUMB = '/assets/nfts/ape-sage.webp'

/**
 * Desktop ("Hero", frame 70347:239, 1200x450): eyebrow "Bem-vindo à Kurio" (14 medium, 1.4px
 * tracking), two-line display headline (43 bold, 70px line height), supporting copy (14/24,
 * text-secondary, 557px wide), the 140x40 "EXPLORAR" button and three primary dots aligned to
 * the right of the text column; a 450px artwork with 24px radius on the right.
 * Mobile ("Mobile / Início", 14:5226): a rounded card on color/surface-card with the eyebrow,
 * a two-line 22px headline ("SEJA DONO DA CULTURA DIGITAL"), a short description, the
 * "EXPLORAR →" link, the artwork (138px, 16px radius) with a small overlapping thumbnail and
 * three dots. The desktop markup is mirrored by the static pre-render in index.html.
 */
const HERO_ALT = 'Arte em destaque: macaco de óculos escuros e jaqueta verde'

export function HomeHero() {
  // Desktop: adopt the <img> shipped in index.html instead of rendering a second one.
  const slotRef = useRef<HTMLDivElement>(null)
  const [adopted] = useState(() => Boolean(prerenderedImage('prerender-hero-image', HERO_ARTWORK)))
  useLayoutEffect(() => {
    const node = prerenderedImage('prerender-hero-image', HERO_ARTWORK)
    if (node && slotRef.current) adoptPrerenderedImage(node, slotRef.current, HERO_ALT)
  }, [])

  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="container-page hidden lg:flex lg:h-[450px] lg:flex-row lg:items-center lg:justify-between lg:pt-8 lg:pl-[160px]"
      >
        <div className="flex w-full max-w-[600px] flex-col gap-11 lg:items-end">
          <div className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-2">
                <p className="text-sm leading-4 font-medium tracking-[1.4px]">Bem-vindo à Kurio</p>
                <h1 id="hero-title" className="text-[43px] leading-[70px] font-bold uppercase">
                  Seja dono do futuro <br />
                  da arte digital
                </h1>
              </div>
              <p className="max-w-[557px] text-sm leading-6 text-muted-foreground">
                Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte
                digital rara, apoie artistas e tenha uma parte da cultura da internet.
              </p>
            </div>
            <Link
              to="/"
              hash="catalogo"
              className="inline-flex h-10 w-[140px] items-center justify-center rounded-md bg-primary text-base leading-5 font-bold text-primary-foreground uppercase outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Explorar
            </Link>
          </div>
          <img src="/assets/icons/hero-dots.svg" alt="" width={40} height={8} />
        </div>
        <div ref={slotRef} className="w-[450px] shrink-0">
          {adopted ? null : (
            <NftImage
              src={HERO_ARTWORK}
              alt={HERO_ALT}
              priority
              large
              sizes="450px"
              width={450}
              height={450}
              className="rounded-hero"
            />
          )}
        </div>
      </section>

      <section
        aria-labelledby="hero-title-mobile"
        className="relative mx-6 mt-4 flex min-h-[195px] overflow-hidden rounded-2xl bg-card p-4 lg:hidden"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 left-[70px] size-[220px] rounded-full bg-[radial-gradient(circle,rgba(210,138,76,0.22)_0%,rgba(210,138,76,0)_70%)]"
        />
        <div className="relative flex min-w-0 flex-1 flex-col gap-2 pb-6">
          <p className="text-[13px] leading-4 font-medium">Bem-vindo à Kurio</p>
          <h1 id="hero-title-mobile" className="text-[22px] leading-[30px] font-bold uppercase">
            Seja dono da
            <br />
            cultura digital
          </h1>
          <p className="max-w-[200px] text-[13px] leading-[18px] text-muted-foreground">
            Descubra NFTs selecionados de criadores do mundo todo.
          </p>
          <Link
            to="/"
            hash="catalogo"
            className="mt-1 inline-flex w-fit items-center gap-2 text-sm font-bold text-text-accent uppercase outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            Explorar
            <img
              src="/assets/icons/arrow-right.svg"
              alt=""
              width={11}
              height={13}
              className="-rotate-90"
            />
          </Link>
        </div>
        <div className="relative w-[138px] shrink-0">
          <NftImage
            src={HERO_ARTWORK}
            alt="Arte em destaque: macaco de óculos escuros e jaqueta verde"
            priority
            sizes="138px"
            width={138}
            height={138}
            className="rounded-2xl"
          />
          <img
            src={artworkThumb(HERO_THUMB)}
            alt=""
            width={56}
            height={56}
            className="absolute -bottom-2 left-2 size-14 rounded-xl border-2 border-card object-cover"
          />
        </div>
        <img
          src="/assets/icons/hero-dots.svg"
          alt=""
          width={28}
          height={6}
          className="absolute bottom-3 left-1/2 w-7 -translate-x-1/2"
        />
      </section>
    </>
  )
}
