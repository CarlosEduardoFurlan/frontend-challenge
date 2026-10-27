import { artworkSrcSet } from '@/components/shared/NftImage'

/**
 * Figma "Blog" (frame 70343:253): centred header ("Diário da Cunhagem" 28 bold on
 * color/text-primary, 14px text-secondary subtitle) and four 268px cards on surface-card with
 * a 195px image, 12px medium meta line, 16px bold title, 12px description and a "Ler mais →"
 * call to action in text-accent. Articles are outside the challenge scope, so the cards are
 * static content from the design.
 */
const POSTS = [
  {
    meta: '12 de setembro  |  Leitura de 6 min',
    title: 'Como funciona a propriedade de NFTs',
    description: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
    artwork: '/assets/nfts/ape-ivory.webp',
  },
  {
    meta: '13 de setembro  |  Leitura de 2 min',
    title: '10 artistas digitais para acompanhar',
    description: 'Conheça criadores que moldam a cultura digital.',
    artwork: '/assets/nfts/ape-emerald.webp',
  },
  {
    meta: '15 de setembro  |  Leitura de 3 min',
    title: 'Raridade, atributos e procedência',
    description: 'Entenda raridade, procedência, direitos autorais e utilidade.',
    artwork: '/assets/nfts/ape-sage.webp',
  },
  {
    meta: '15 de setembro  |  Leitura de 2 min',
    title: 'Como proteger sua carteira',
    description: 'Proteja sua carteira, seus ativos e sua identidade.',
    artwork: '/assets/nfts/ape-golden.webp',
  },
] as const

export function BlogSection() {
  return (
    <section id="diario" aria-labelledby="blog-title" className="container-page scroll-mt-24 pt-24">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 id="blog-title" className="text-[28px] leading-tight font-bold text-text-primary">
          Diário da Cunhagem
        </h2>
        <p className="text-sm text-muted-foreground">
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
      </div>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-[repeat(4,268px)]">
        {POSTS.map((post) => (
          <li key={post.title} className="flex flex-col overflow-hidden rounded-lg bg-card">
            <img
              src={post.artwork}
              srcSet={artworkSrcSet(post.artwork)}
              sizes="(min-width: 1024px) 268px, 90vw"
              alt=""
              width={268}
              height={195}
              loading="lazy"
              decoding="async"
              className="h-[195px] w-full object-cover"
            />
            <div className="flex flex-1 flex-col gap-2 px-4 pt-3 pb-4">
              <p className="text-xs leading-4 font-medium whitespace-pre text-muted-foreground">
                {post.meta}
              </p>
              <h3 className="text-base font-bold text-text-primary">{post.title}</h3>
              <p className="text-xs leading-4 font-medium text-muted-foreground">
                {post.description}
              </p>
              <p
                className="mt-auto text-xs leading-4 font-bold text-text-accent"
                title="Artigo fora do escopo da demonstração"
              >
                Ler mais <span className="font-normal">→</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
