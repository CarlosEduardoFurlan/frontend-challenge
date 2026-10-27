import { z } from 'zod'

/**
 * URL state of the catalog. Every filter, the sort order and the page live in the search
 * params so refresh, direct access and browser history restore the exact same view.
 */
export const NFT_CATEGORIES = [
  'arte',
  'colecionavel',
  'games',
  'musica',
  'fotografia',
  'utilitario',
] as const
export type NftCategory = (typeof NFT_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<NftCategory, string> = {
  arte: 'Arte',
  colecionavel: 'Colecionáveis',
  games: 'Games',
  musica: 'Música',
  fotografia: 'Fotografia',
  utilitario: 'Utilitários',
}

export const SORT_OPTIONS = ['relevance', 'newest', 'price_asc', 'price_desc', 'popular'] as const
export type SortOption = (typeof SORT_OPTIONS)[number]

export const SORT_LABELS: Record<SortOption, string> = {
  relevance: 'Relevância',
  newest: 'Mais recentes',
  price_asc: 'Menor preço',
  price_desc: 'Maior preço',
  popular: 'Mais populares',
}

export const DEFAULT_PAGE_SIZE = 9

const categoryList = z
  .union([z.array(z.enum(NFT_CATEGORIES)), z.enum(NFT_CATEGORIES)])
  .transform((value) => (Array.isArray(value) ? value : [value]))
  .optional()
  .catch(undefined)

const priceString = z
  .string()
  .regex(/^\d+(\.\d+)?$/)
  .optional()
  .catch(undefined)

export const catalogSearchSchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
  category: categoryList,
  minPrice: priceString,
  maxPrice: priceString,
  available: z
    .preprocess((value) => value === true || value === 'true', z.boolean())
    .optional()
    .catch(undefined),
  sort: z.enum(SORT_OPTIONS).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
})

export type CatalogSearch = z.infer<typeof catalogSearchSchema>

/** Normalised values used for the API request and for rendering controls. */
export function resolveCatalogSearch(search: CatalogSearch) {
  return {
    q: search.q ?? '',
    category: search.category ?? [],
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    available: search.available ?? false,
    sort: search.sort ?? 'relevance',
    page: search.page ?? 1,
    pageSize: DEFAULT_PAGE_SIZE,
  }
}

export type ResolvedCatalogSearch = ReturnType<typeof resolveCatalogSearch>
