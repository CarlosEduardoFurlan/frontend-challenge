/**
 * REST + Socket.IO contracts shared by the mock layer (MSW), the Axios services and the UI.
 * Documented in ARCHITECTURE.md. Monetary values are decimal strings ("0.125"), never numbers.
 */
import type { DecimalString } from '@/lib/money'
import type { NftCategory, SortOption } from '@/features/catalog/search-params'

export type { DecimalString }

/* ----------------------------------------------------------------------------
 * Errors
 * ------------------------------------------------------------------------- */
export interface ApiErrorResponse {
  code:
    | 'validation_error'
    | 'unauthorized'
    | 'session_expired'
    | 'forbidden'
    | 'not_found'
    | 'conflict'
    | 'email_taken'
    | 'invalid_credentials'
    | 'coupon_invalid'
    | 'coupon_expired'
    | 'availability_conflict'
    | 'price_changed'
    | 'quote_expired'
    | 'idempotency_conflict'
    | 'rate_limited'
    | 'internal_error'
    | 'service_unavailable'
    | string
  message: string
  details?: Record<string, string[]>
}

/* ----------------------------------------------------------------------------
 * Session & account
 * ------------------------------------------------------------------------- */
export interface User {
  id: string
  name: string
  username: string
  email: string
  bio: string
  avatarUrl: string | null
  createdAt: string
}

export interface Session {
  token: string
  user: User
  expiresAt: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

/* ----------------------------------------------------------------------------
 * NFTs
 * ------------------------------------------------------------------------- */
export type NetworkId = 'ethereum' | 'polygon' | 'arbitrum'

export interface NetworkInfo {
  id: NetworkId
  label: string
  feeEth: DecimalString
  explorerBaseUrl: string
}

export interface NftEdition {
  id: string
  name: string
  priceEth: DecimalString
  /** Units still available for purchase. */
  available: number
  total: number
  /** Hard limit per order, independent of availability. */
  maxPerOrder: number
}

export interface NftCreator {
  id: string
  name: string
  avatarUrl: string
}

export interface NftTrait {
  label: string
  value: string
}

export interface NftSummary {
  id: string
  name: string
  collection: string
  collectionId: string
  category: NftCategory
  imageUrl: string
  /** Lowest edition price, used by cards and sorting. */
  priceEth: DecimalString
  /** Sum of edition availability. */
  available: number
  featured: boolean
  /** Carries the "Raridade: Rara" trait (ribbon on the mobile cards). */
  rare: boolean
  likes: number
  createdAt: string
  /** Monotonic version bumped on every price/availability change. */
  version: number
}

export interface Nft extends NftSummary {
  description: string
  images: string[]
  creator: NftCreator
  traits: NftTrait[]
  editions: NftEdition[]
  network: NetworkId
}

export interface NftListParams {
  q?: string
  category?: NftCategory[]
  network?: NetworkId[]
  minPrice?: DecimalString
  maxPrice?: DecimalString
  available?: boolean
  sort?: SortOption
  page?: number
  pageSize?: number
  featured?: boolean
  ids?: string[]
}

export interface CategoryFacet {
  id: NftCategory
  label: string
  count: number
}

export interface NetworkFacet {
  id: NetworkId
  label: string
  count: number
}

export interface NftListResponse {
  items: NftSummary[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  facets: {
    categories: CategoryFacet[]
    networks: NetworkFacet[]
    priceRange: { min: DecimalString; max: DecimalString }
  }
}

/* ----------------------------------------------------------------------------
 * Favorites
 * ------------------------------------------------------------------------- */
export interface FavoritesResponse {
  nftIds: string[]
  items: NftSummary[]
}

/* ----------------------------------------------------------------------------
 * Cart
 * ------------------------------------------------------------------------- */
export interface CartItem {
  id: string
  nftId: string
  editionId: string
  quantity: number
  /** Price seen when the item was added; compared with `unitPriceEth` to flag changes. */
  addedPriceEth: DecimalString
  /** Current price of the edition. */
  unitPriceEth: DecimalString
  lineTotalEth: DecimalString
  available: number
  maxPerOrder: number
  nft: {
    id: string
    name: string
    collection: string
    imageUrl: string
    version: number
  }
  edition: {
    id: string
    name: string
  }
}

export interface Cart {
  id: string
  items: CartItem[]
  itemCount: number
  subtotalEth: DecimalString
  /** Coupon stored on the cart; validated again by every quote. */
  couponCode: string | null
  updatedAt: string
  version: number
}

export interface AddCartItemRequest {
  nftId: string
  editionId: string
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface MergeCartRequest {
  guestCartId: string
}

/* ----------------------------------------------------------------------------
 * Quote (pricing)
 * ------------------------------------------------------------------------- */
export type QuoteLineStatus = 'ok' | 'price_changed' | 'quantity_reduced' | 'sold_out'

export interface QuoteLine {
  cartItemId: string
  nftId: string
  editionId: string
  name: string
  editionName: string
  imageUrl: string
  quantity: number
  requestedQuantity: number
  unitPriceEth: DecimalString
  previousUnitPriceEth: DecimalString
  lineTotalEth: DecimalString
  status: QuoteLineStatus
  nftVersion: number
}

export interface QuoteCoupon {
  code: string
  description: string
  type: 'percent' | 'fixed'
  value: DecimalString
}

export interface Quote {
  quoteId: string
  /** Hash of the inputs that produced this quote; the order must send it back. */
  quoteVersion: string
  issuedAt: string
  expiresAt: string
  network: NetworkId
  lines: QuoteLine[]
  coupon: QuoteCoupon | null
  subtotalEth: DecimalString
  discountEth: DecimalString
  networkFeeEth: DecimalString
  totalEth: DecimalString
  /** True when any line changed compared to the cart. */
  hasChanges: boolean
}

export interface QuoteRequest {
  couponCode?: string | null
  network?: NetworkId
}

/* ----------------------------------------------------------------------------
 * Orders
 * ------------------------------------------------------------------------- */
export type OrderStatus = 'pending' | 'confirmed' | 'rejected'

export interface OrderItem {
  nftId: string
  editionId: string
  name: string
  editionName: string
  imageUrl: string
  quantity: number
  unitPriceEth: DecimalString
  lineTotalEth: DecimalString
}

export interface OrderCollector {
  name: string
  email: string
  document: string
}

export interface OrderWallet {
  id: string
  label: string
  address: string
  kind: WalletKind
}

export interface Order {
  id: string
  status: OrderStatus
  version: number
  createdAt: string
  updatedAt: string
  network: NetworkId
  wallet: OrderWallet
  collector: OrderCollector
  items: OrderItem[]
  coupon: QuoteCoupon | null
  subtotalEth: DecimalString
  discountEth: DecimalString
  networkFeeEth: DecimalString
  totalEth: DecimalString
  /** Present once the simulated payment is confirmed. */
  txHash: string | null
  explorerUrl: string | null
  rejectionReason: string | null
}

export interface CreateOrderRequest {
  quoteId: string
  quoteVersion: string
  walletId: string
  network: NetworkId
  collector: OrderCollector
  acceptedTerms: boolean
}

export interface OrderListResponse {
  items: Order[]
}

/* ----------------------------------------------------------------------------
 * Profile & wallets
 * ------------------------------------------------------------------------- */
export interface UpdateProfileRequest {
  name?: string
  username?: string
  bio?: string
  /** Data URL (image/*) or null to remove. */
  avatarUrl?: string | null
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export type WalletKind = 'primary' | 'secondary'

export interface Wallet {
  id: string
  kind: WalletKind
  label: string
  address: string
  network: NetworkId
  createdAt: string
  updatedAt: string
}

export interface WalletsResponse {
  primary: Wallet | null
  secondary: Wallet | null
}

export interface UpsertWalletRequest {
  label: string
  address: string
  network: NetworkId
}

/** Simulated wallet connection at checkout (no browser extension involved). */
export interface WalletConnectRequest {
  walletId: string
  network: NetworkId
}

export interface WalletConnection {
  walletId: string
  address: string
  network: NetworkId
  connectedAt: string
  /** When set, the simulated wallet disconnects after this many ms. */
  sessionTtlMs: number | null
}

/* ----------------------------------------------------------------------------
 * Socket.IO events
 * ------------------------------------------------------------------------- */
export interface RealtimeEnvelope<TType extends string, TPayload> {
  /** Stable unique id, used for de-duplication. */
  eventId: string
  type: TType
  /** Affected resource id. */
  resourceId: string
  /** Monotonic version of the resource; older versions are ignored. */
  version: number
  emittedAt: string
  payload: TPayload
}

export interface NftUpdatedPayload {
  priceEth: DecimalString
  available: number
  editions: Array<Pick<NftEdition, 'id' | 'priceEth' | 'available'>>
  reason: 'price' | 'availability' | 'both'
}

export type NftUpdatedEvent = RealtimeEnvelope<'nft.updated', NftUpdatedPayload>

export interface OrderUpdatedPayload {
  status: OrderStatus
  txHash: string | null
  explorerUrl: string | null
  rejectionReason: string | null
  updatedAt: string
}

export type OrderUpdatedEvent = RealtimeEnvelope<'order.updated', OrderUpdatedPayload>

export interface ServerToClientEvents {
  'nft.updated': (event: NftUpdatedEvent) => void
  'order.updated': (event: OrderUpdatedEvent) => void
}

export interface ClientToServerEvents {
  'orders.subscribe': (orderId: string) => void
  'orders.unsubscribe': (orderId: string) => void
}

/* ----------------------------------------------------------------------------
 * Mock control (only served by MSW; not part of the product API)
 * ------------------------------------------------------------------------- */
export interface MockScenarioInfo {
  id: string
  label: string
  description: string
}

export interface MockStatus {
  scenario: string
  scenarios: MockScenarioInfo[]
  seededAt: string
  connectedSockets: number
}
