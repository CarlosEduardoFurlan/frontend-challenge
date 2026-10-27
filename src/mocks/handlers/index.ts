import { controlHandlers } from './control'
import { nftHandlers } from './nfts'

export const handlers = [...controlHandlers, ...nftHandlers]
