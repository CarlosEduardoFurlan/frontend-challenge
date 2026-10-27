import { authHandlers } from './auth'
import { controlHandlers } from './control'
import { favoritesHandlers } from './favorites'
import { nftHandlers } from './nfts'
import { profileHandlers } from './profile'
import { walletsHandlers } from './wallets'

export const handlers = [
  ...controlHandlers,
  ...authHandlers,
  ...nftHandlers,
  ...favoritesHandlers,
  ...profileHandlers,
  ...walletsHandlers,
]
