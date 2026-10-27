import { Link } from '@tanstack/react-router'

import { NftImage } from '@/components/shared/NftImage'
import { Button } from '@/components/ui/button'

/**
 * Hero of the home page. Mirrors the Figma composition: eyebrow, uppercase display headline,
 * supporting copy and a primary CTA on the left; a large square artwork on the right.
 */
export function HomeHero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="container-page grid items-center gap-8 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] md:py-16 lg:gap-16"
    >
      <div className="flex flex-col items-start gap-5">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Marketplace de arte digital
        </p>
        <h1
          id="hero-title"
          className="font-display text-[1.75rem] leading-[1.25] uppercase sm:text-4xl lg:text-[2.75rem]"
        >
          Seja dono do futuro da arte digital
        </h1>
        <p className="max-w-prose text-base text-muted-foreground">
          Descubra edições limitadas de artistas independentes, acompanhe preços em tempo real e
          finalize sua compra com carteiras simuladas, sem instalar nada.
        </p>
        <Button asChild size="lg">
          <Link to="/" hash="catalogo">
            Explorar catálogo
          </Link>
        </Button>
      </div>
      <div className="relative mx-auto w-full max-w-md md:max-w-none">
        <div
          className="absolute -inset-4 -z-10 rounded-3xl bg-primary/10 blur-2xl"
          aria-hidden="true"
        />
        <NftImage
          src="/nfts/nft-001-1.webp"
          alt="Arte em destaque: composição geométrica em tons de laranja"
          priority
          sizes="(min-width: 768px) 448px, 90vw"
          className="rounded-2xl border border-border shadow-card"
        />
      </div>
    </section>
  )
}
