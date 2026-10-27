import { Link } from '@tanstack/react-router'

import { NftImage } from '@/components/shared/NftImage'

/** Artwork of the hero in the Figma file ("Frame 136", the Emerald Ape, exported as ape-emerald). */
export const HERO_ARTWORK = '/assets/nfts/ape-emerald.webp'

/**
 * Figma "Hero" (frame 70347:239, 1200x450): eyebrow "Bem-vindo à Kurio" (14 medium, 1.4px
 * tracking), two-line display headline (43 bold, 70px line height), supporting copy (14/24,
 * text-secondary, 557px wide), the 140x40 "EXPLORAR" button and three primary dots aligned to
 * the right of the text column; a 450px artwork with 24px radius on the right.
 * The markup is mirrored by the static pre-render in index.html.
 */
export function HomeHero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="container-page flex flex-col gap-8 pt-8 lg:h-[450px] lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:pt-8 lg:pl-[160px]"
    >
      <div className="flex w-full max-w-[600px] flex-col gap-11 lg:items-end">
        <div className="flex w-full flex-col gap-8">
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-2">
              <p className="text-sm leading-4 font-medium tracking-[1.4px]">Bem-vindo à Kurio</p>
              <h1
                id="hero-title"
                className="text-[28px] leading-[44px] font-bold uppercase sm:text-[36px] sm:leading-[56px] lg:text-[43px] lg:leading-[70px]"
              >
                Seja dono do futuro
                <br className="hidden lg:inline" />
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
        <img
          src="/assets/icons/hero-dots.svg"
          alt=""
          width={40}
          height={8}
          className="hidden lg:block"
        />
      </div>
      <div className="w-full max-w-[450px] shrink-0 lg:w-[450px]">
        <NftImage
          src={HERO_ARTWORK}
          alt="Arte em destaque: macaco de óculos escuros e jaqueta verde"
          priority
          sizes="(min-width: 1024px) 450px, 90vw"
          width={450}
          height={450}
          className="rounded-hero"
        />
      </div>
    </section>
  )
}
