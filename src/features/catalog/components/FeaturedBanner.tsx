import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { Skeleton } from '@/components/ui/skeleton'
import { artworkSrcSet } from '@/components/shared/NftImage'

import { featuredNftsQuery } from '../queries'

const HERO_NFT_ID = 'nft-001'

/**
 * Figma "Featured NFT Banner" (70410:3791, 310x470): primary gradient background (10% → 3%),
 * "NFT EM DESTAQUE" (24 bold, text-accent), "OFERTA LIMITADA" (22 bold, centred) and a
 * 310x368 artwork with 22px radius, plus three decorative shapes. The artwork is the most
 * popular featured NFT that is not already shown in the hero.
 */
export function FeaturedBanner() {
  const featured = useQuery(featuredNftsQuery())
  const nft =
    featured.data?.items.find((item) => item.id !== HERO_NFT_ID) ?? featured.data?.items[0]

  return (
    <section
      aria-labelledby="featured-title"
      className="relative h-[470px] w-full overflow-hidden bg-[linear-gradient(180deg,rgba(210,138,76,0.1)_0%,rgba(210,138,76,0.03)_100%)] pt-6 pb-1 lg:w-[310px]"
      data-testid="featured-banner"
    >
      <div className="flex flex-col items-center gap-4">
        <h2
          id="featured-title"
          className="px-5 text-2xl leading-8 font-bold text-text-accent uppercase"
        >
          NFT em destaque
        </h2>
        <p className="px-5 text-center text-[22px] leading-4 font-bold uppercase">
          Oferta limitada
        </p>
      </div>
      {nft ? (
        <Link
          to="/nft/$nftId"
          params={{ nftId: nft.id }}
          className="mt-4 block h-[368px] w-full overflow-hidden rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${nft.name}, NFT em destaque`}
          data-testid="featured-link"
        >
          <img
            src={nft.imageUrl}
            srcSet={artworkSrcSet(nft.imageUrl)}
            sizes="310px"
            alt={`Arte do NFT ${nft.name}`}
            width={310}
            height={368}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        </Link>
      ) : featured.isError ? (
        <p className="mt-4 px-5 text-center text-sm text-muted-foreground" role="status">
          Destaque indisponível no momento.
        </p>
      ) : (
        <Skeleton className="mt-4 h-[368px] w-full rounded-[22px]" />
      )}
      <span
        aria-hidden="true"
        className="absolute top-[299px] left-4 size-[22px] rounded-[7px] border-2 border-[#46a358] opacity-20"
      />
      <span
        aria-hidden="true"
        className="absolute top-[343px] left-[248px] size-[45px] rounded-full bg-[linear-gradient(145deg,rgba(210,138,76,0.3)_46%,rgba(210,138,76,0)_103%)]"
      />
      <span
        aria-hidden="true"
        className="absolute top-[105px] left-[38px] size-[15px] rounded-full bg-[linear-gradient(145deg,rgba(210,138,76,0.3)_46%,rgba(210,138,76,0)_103%)]"
      />
    </section>
  )
}
