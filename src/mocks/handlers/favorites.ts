import { http } from 'msw'

import { env } from '@/lib/env'
import type { FavoritesResponse } from '@/types/api'

import { httpError, json, requireUser, withScenario } from '../lib/http'
import { findNft, toSummary } from '../lib/nft-store'
import { getDb, persist } from '../persistence/db'

function favoritesOf(userId: string): FavoritesResponse {
  const db = getDb()
  const ids = db.favorites[userId] ?? []
  const items = ids
    .map(findNft)
    .filter((nft): nft is NonNullable<typeof nft> => Boolean(nft))
    .map(toSummary)
  return { nftIds: ids, items }
}

export const favoritesHandlers = [
  http.get(
    `${env.apiUrl}/favorites`,
    withScenario(({ request }) => {
      const { user } = requireUser(request)
      return json(favoritesOf(user.id))
    }),
  ),

  http.post(
    `${env.apiUrl}/favorites/:nftId`,
    withScenario(({ request, params }) => {
      const { user } = requireUser(request)
      const nftId = String(params.nftId)
      if (!findNft(nftId)) throw httpError(404, 'not_found', 'NFT não encontrado.')
      const db = getDb()
      const list = (db.favorites[user.id] ??= [])
      if (!list.includes(nftId)) list.push(nftId)
      persist()
      return json(favoritesOf(user.id), { status: 201 })
    }),
  ),

  http.delete(
    `${env.apiUrl}/favorites/:nftId`,
    withScenario(({ request, params }) => {
      const { user } = requireUser(request)
      const db = getDb()
      db.favorites[user.id] = (db.favorites[user.id] ?? []).filter(
        (id) => id !== String(params.nftId),
      )
      persist()
      return json(favoritesOf(user.id))
    }),
  ),
]
