/**
 * URL state of the catalog. Every filter, the sort order and the page live in the search
 * params so refresh, direct access and browser history restore the exact same view.
 *
 * Parsing is hand-written (no Zod) on purpose: route search validation runs in the initial
 * bundle of every page, and Zod alone would add ~60 KB (gzip) before the first paint.
 * Forms and the mock API keep using Zod in lazily loaded chunks.
 */
export const NFT_CATEGORIES = [
  'arte',
  'fotografia',
  'musica',
  'colecionavel',
  'games',
  'utilitario',
] as const
export type NftCategory = (typeof NFT_CATEGORIES)[number]

/** Labels follow the "Coleções" list of the Figma sidebar. */
export const CATEGORY_LABELS: Record<NftCategory, string> = {
  arte: 'Arte digital',
  fotografia: 'Fotografia',
  musica: 'Música',
  colecionavel: 'Colecionáveis',
  games: 'Jogos',
  utilitario: 'Utilidade',
}

export const NFT_NETWORKS = ['ethereum', 'polygon', 'arbitrum'] as const
export type NftNetwork = (typeof NFT_NETWORKS)[number]

export const SORT_OPTIONS = ['relevance', 'newest', 'price_asc', 'price_desc', 'popular'] as const
export type SortOption = (typeof SORT_OPTIONS)[number]

export const SORT_LABELS: Record<SortOption, string> = {
  relevance: 'Relevância',
  newest: 'Listados recentemente',
  price_asc: 'Menor preço',
  price_desc: 'Maior preço',
  popular: 'Mais populares',
}

export const DEFAULT_PAGE_SIZE = 9

export interface CatalogSearch {
  q?: string
  category?: NftCategory[]
  network?: NftNetwork[]
  minPrice?: string
  maxPrice?: string
  available?: boolean
  sort?: SortOption
  page?: number
}

const PRICE_PATTERN = /^\d+(\.\d+)?$/

function isCategory(value: unknown): value is NftCategory {
  return typeof value === 'string' && (NFT_CATEGORIES as readonly string[]).includes(value)
}

function parseCategories(value: unknown): NftCategory[] | undefined {
  const list = Array.isArray(value) ? value : value === undefined ? [] : [value]
  const categories = list.filter(isCategory)
  return categories.length ? [...new Set(categories)] : undefined
}

function isNetwork(value: unknown): value is NftNetwork {
  return typeof value === 'string' && (NFT_NETWORKS as readonly string[]).includes(value)
}

function parseNetworks(value: unknown): NftNetwork[] | undefined {
  const list = Array.isArray(value) ? value : value === undefined ? [] : [value]
  const networks = list.filter(isNetwork)
  return networks.length ? [...new Set(networks)] : undefined
}

function parsePrice(value: unknown): string | undefined {
  return typeof value === 'string' && PRICE_PATTERN.test(value) ? value : undefined
}

function parsePage(value: unknown): number | undefined {
  const page = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  return Number.isInteger(page) && page >= 1 ? page : undefined
}

/** Tolerant parser: invalid values are dropped instead of failing the navigation. */
export function parseCatalogSearch(input: unknown): CatalogSearch {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const q = typeof raw.q === 'string' ? raw.q.trim() : ''
  const sort =
    typeof raw.sort === 'string' && (SORT_OPTIONS as readonly string[]).includes(raw.sort)
      ? (raw.sort as SortOption)
      : undefined
  const result: CatalogSearch = {}
  if (q) result.q = q
  const category = parseCategories(raw.category)
  if (category) result.category = category
  const network = parseNetworks(raw.network)
  if (network) result.network = network
  const minPrice = parsePrice(raw.minPrice)
  if (minPrice) result.minPrice = minPrice
  const maxPrice = parsePrice(raw.maxPrice)
  if (maxPrice) result.maxPrice = maxPrice
  if (raw.available === true || raw.available === 'true') result.available = true
  if (sort) result.sort = sort
  const page = parsePage(raw.page)
  if (page) result.page = page
  return result
}

/** Normalised values used for the API request and for rendering controls. */
export function resolveCatalogSearch(search: CatalogSearch) {
  return {
    q: search.q ?? '',
    category: search.category ?? [],
    network: search.network ?? [],
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    available: search.available ?? false,
    sort: search.sort ?? 'relevance',
    page: search.page ?? 1,
    pageSize: DEFAULT_PAGE_SIZE,
  }
}

export type ResolvedCatalogSearch = ReturnType<typeof resolveCatalogSearch>
