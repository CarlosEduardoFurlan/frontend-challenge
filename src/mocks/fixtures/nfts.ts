import type { NftCategory } from '@/features/catalog/search-params'
import type { Nft, NftCreator, NftEdition } from '@/types/api'

/**
 * 24 NFTs across 6 collections and 6 categories. Prices, availability and dates are spread
 * out on purpose so filters, sorting and pagination (9 per page = 3 pages) are exercised.
 * One NFT is fully sold out and one has a sold-out edition.
 */
interface CollectionSeed {
  id: string
  name: string
  category: NftCategory
  creator: NftCreator
}

const COLLECTIONS: CollectionSeed[] = [
  {
    id: 'geometria-viva',
    name: 'Geometria Viva',
    category: 'arte',
    creator: { id: 'creator-1', name: 'Helena Prado', avatarUrl: '/avatars/geometria-viva.webp' },
  },
  {
    id: 'cosmos-pixelado',
    name: 'Cosmos Pixelado',
    category: 'games',
    creator: { id: 'creator-2', name: 'Studio Órbita', avatarUrl: '/avatars/cosmos-pixelado.webp' },
  },
  {
    id: 'flora-sintetica',
    name: 'Flora Sintética',
    category: 'fotografia',
    creator: { id: 'creator-3', name: 'Marina Castro', avatarUrl: '/avatars/flora-sintetica.webp' },
  },
  {
    id: 'ruido-urbano',
    name: 'Ruído Urbano',
    category: 'musica',
    creator: { id: 'creator-4', name: 'DJ Vetor', avatarUrl: '/avatars/ruido-urbano.webp' },
  },
  {
    id: 'mares-digitais',
    name: 'Marés Digitais',
    category: 'colecionavel',
    creator: { id: 'creator-5', name: 'Coletivo Azul', avatarUrl: '/avatars/mares-digitais.webp' },
  },
  {
    id: 'vertices',
    name: 'Vértices',
    category: 'utilitario',
    creator: { id: 'creator-6', name: 'Lab Vértice', avatarUrl: '/avatars/vertices.webp' },
  },
]

const NAMES = [
  'Aurora Fragmentada',
  'Pulso Laranja',
  'Órbita Silenciosa',
  'Nebulosa 0x7',
  'Jardim Latente',
  'Clorofila Elétrica',
  'Baixo Contínuo',
  'Frequência Cinza',
  'Maré Alta',
  'Profundidade Azul',
  'Ápice',
  'Diagonal Dourada',
  'Simetria Quebrada',
  'Calor Residual',
  'Satélite Perdido',
  'Pixel Gravitacional',
  'Folha Binária',
  'Estufa Noturna',
  'Ruído Branco',
  'Compasso Vermelho',
  'Correnteza',
  'Ressaca Digital',
  'Vértice Nove',
  'Malha Solar',
]

const DESCRIPTIONS = [
  'Composição gerada a partir de regras simples que evoluem até encontrar equilíbrio. Cada edição carrega um estado diferente do mesmo sistema.',
  'Obra que explora a tensão entre formas rígidas e gradientes orgânicos. Impressa em alta resolução e registrada com metadados verificáveis.',
  'Parte de uma série sobre memória e repetição: a mesma estrutura, variações mínimas, resultados que nunca se repetem.',
]

const BASE_DATE = Date.UTC(2026, 0, 10, 12, 0, 0)

function priceFor(index: number): string {
  // Spread between 0.05 and 2.4 ETH with deterministic "irregular" decimals.
  const table = [
    '0.05',
    '0.12',
    '0.18',
    '0.25',
    '0.3',
    '0.42',
    '0.55',
    '0.6',
    '0.75',
    '0.88',
    '0.95',
    '1.1',
    '1.25',
    '1.4',
    '1.55',
    '1.7',
    '1.85',
    '2.0',
    '2.15',
    '2.4',
    '0.08',
    '0.33',
    '0.47',
    '1.02',
  ]
  return table[index % table.length] ?? '0.5'
}

function editionsFor(index: number, basePrice: string): NftEdition[] {
  const id = `nft-${String(index + 1).padStart(3, '0')}`
  const premiumPrice = (Number(basePrice) * 2.5).toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
  const editions: NftEdition[] = [
    {
      id: `${id}-std`,
      name: 'Edição padrão',
      priceEth: basePrice,
      available: 12 - (index % 7),
      total: 20,
      maxPerOrder: 5,
    },
    {
      id: `${id}-ltd`,
      name: 'Edição limitada',
      priceEth: premiumPrice,
      available: index % 4 === 3 ? 0 : 3 - (index % 3),
      total: 5,
      maxPerOrder: 2,
    },
  ]
  // nft-013: completely sold out to exercise the "indisponível" state.
  if (index === 12) editions.forEach((e) => (e.available = 0))
  // nft-007: tiny stock to exercise quantity limits (max 2 of std, ltd sold out).
  if (index === 6) {
    editions[0]!.available = 2
    editions[1]!.available = 0
  }
  return editions
}

export function buildNftFixtures(): Nft[] {
  return NAMES.map((name, index) => {
    const id = `nft-${String(index + 1).padStart(3, '0')}`
    const collection = COLLECTIONS[index % COLLECTIONS.length]!
    const basePrice = priceFor(index)
    const editions = editionsFor(index, basePrice)
    const available = editions.reduce((sum, e) => sum + e.available, 0)
    const createdAt = new Date(BASE_DATE + index * 36 * 60 * 60 * 1000).toISOString()

    return {
      id,
      name,
      collection: collection.name,
      collectionId: collection.id,
      category: collection.category,
      imageUrl: `/nfts/${id}-1.webp`,
      images: [`/nfts/${id}-1.webp`, `/nfts/${id}-2.webp`, `/nfts/${id}-3.webp`],
      priceEth: basePrice,
      available,
      featured: [0, 3, 8, 11].includes(index),
      likes: 180 - index * 6 + (index % 5) * 11,
      createdAt,
      version: 1,
      description: DESCRIPTIONS[index % DESCRIPTIONS.length]!,
      creator: collection.creator,
      traits: [
        { label: 'Técnica', value: index % 2 === 0 ? 'Generativa' : 'Mista' },
        { label: 'Resolução', value: '4096 × 4096' },
        { label: 'Ano', value: '2026' },
        { label: 'Raridade', value: index % 5 === 0 ? 'Rara' : 'Comum' },
      ],
      editions,
      network: (['ethereum', 'polygon', 'arbitrum'] as const)[index % 3]!,
    }
  })
}
