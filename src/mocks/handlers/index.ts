import { authHandlers } from './auth'
import { controlHandlers } from './control'
import { favoritesHandlers } from './favorites'
import { nftHandlers } from './nfts'

export const handlers = [...controlHandlers, ...authHandlers, ...nftHandlers, ...favoritesHandlers]
