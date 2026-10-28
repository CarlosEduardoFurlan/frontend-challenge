import { Link } from '@tanstack/react-router'

import { artworkSrcSet } from '@/components/shared/NftImage'

/**
 * Figma "Promos" (frame 70353:241): two 586x250 cards on color/surface-card with the artwork
 * bleeding on the left (292px, 18px radius), right-aligned copy (18 bold title, 14/24
 * text-secondary paragraph) and a 140x40 "Explorar" button with the curved arrow icon.
 * Two concentric primary rings decorate the bottom-left corner (promo-rings.svg).
 */
const PROMOS = [
  {
    id: 'genesis',
    title: ['Lançamentos gênesis', 'de edição limitada'],
    description: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
    artwork: '/assets/nfts/ape-emerald.webp',
    sort: 'newest',
  },
  {
    id: 'curated',
    title: ['Arte digital selecionada', 'e muito mais'],
    description:
      'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.',
    artwork: '/assets/nfts/ape-ivory.webp',
    sort: 'popular',
  },
] as const

export function PromoSection() {
  return (
    <section
      id="criadores"
      aria-label="Destaques dos criadores"
      className="container-page scroll-mt-24 pt-24"
    >
      <ul className="grid gap-7 lg:grid-cols-2">
        {PROMOS.map((promo) => (
          <li
            key={promo.id}
            className="relative flex flex-col overflow-hidden rounded-lg bg-card lg:min-h-[250px] lg:flex-row"
          >
            <img
              src={promo.artwork}
              srcSet={artworkSrcSet(promo.artwork)}
              sizes="292px"
              alt=""
              width={292}
              height={250}
              loading="lazy"
              decoding="async"
              className="h-[200px] w-full object-cover lg:absolute lg:top-0 lg:-left-[5px] lg:h-[250px] lg:w-[292px] lg:rounded-[18px]"
            />
            <img
              src="/assets/banners/promo-rings.svg"
              alt=""
              width={586}
              height={250}
              className="pointer-events-none absolute inset-0 hidden h-[250px] w-full max-w-none lg:block"
            />
            <div className="relative flex w-full flex-col items-end px-5 pt-6 pb-6 text-right lg:ml-auto lg:max-w-[300px] lg:pt-[37px] lg:pr-[30px] lg:pl-4">
              <h3 className="text-lg leading-6 font-bold">
                {promo.title[0]}
                <br />
                {promo.title[1]}
              </h3>
              <p className="mt-[9px] max-w-[263px] text-sm leading-6 text-muted-foreground">
                {promo.description}
              </p>
              <Link
                to="/"
                search={{ sort: promo.sort }}
                hash="catalogo"
                className="mt-[25px] inline-flex h-10 w-[140px] items-center justify-center gap-1 rounded-md bg-primary text-sm leading-5 font-medium text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
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
          </li>
        ))}
      </ul>
    </section>
  )
}
