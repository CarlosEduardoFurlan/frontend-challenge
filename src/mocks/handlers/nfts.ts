import { http } from 'msw'

import {
  NFT_CATEGORIES,
  SORT_OPTIONS,
  type NftCategory,
  type SortOption,
} from '@/features/catalog/search-params'
import { env } from '@/lib/env'
import type { NftListParams } from '@/types/api'

import { httpError, json, withScenario } from '../lib/http'
import { findNft, queryNfts } from '../lib/nft-store'
import { getCurrentScenario } from '../lib/scenario-state'

function parseListParams(url: URL): NftListParams {
  const categories = url.searchParams
    .getAll('category')
    .filter((c): c is NftCategory => (NFT_CATEGORIES as readonly string[]).includes(c))
  const sort = url.searchParams.get('sort')
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(url.searchParams.get('pageSize') ?? '9')
  const ids = url.searchParams.getAll('ids')

  return {
    q: url.searchParams.get('q') ?? undefined,
    category: categories.length ? categories : undefined,
    minPrice: url.searchParams.get('minPrice') ?? undefined,
    maxPrice: url.searchParams.get('maxPrice') ?? undefined,
    available: url.searchParams.get('available') === 'true',
    sort: (SORT_OPTIONS as readonly string[]).includes(sort ?? '')
      ? (sort as SortOption)
      : 'relevance',
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 9,
    featured: url.searchParams.get('featured') === 'true',
    ids: ids.length ? ids : undefined,
  }
}

export const nftHandlers = [
  http.get(
    `${env.apiUrl}/nfts`,
    withScenario(
      ({ request }) => {
        const params = parseListParams(new URL(request.url))
        return json(queryNfts(params, { empty: getCurrentScenario().emptyCatalog }))
      },
      { listEndpoint: true },
    ),
  ),

  http.get(
    `${env.apiUrl}/nfts/:nftId`,
    withScenario(({ params }) => {
      const nft = findNft(String(params.nftId))
      if (!nft) throw httpError(404, 'not_found', 'NFT não encontrado.')
      return json(nft)
    }),
  ),
]
