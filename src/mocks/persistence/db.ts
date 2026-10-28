import type { DecimalString } from '@/lib/money'
import type { NetworkId, Nft, Order, QuoteCoupon, QuoteLine, Wallet, WalletKind } from '@/types/api'

import { COUPONS, type CouponSeed } from '../fixtures/coupons'
import { buildNftFixtures } from '../fixtures/nfts'
import { DEMO_USERS } from '../fixtures/users'
import { hashPassword, randomId, randomSalt } from '../lib/crypto'
import { readJson, remove, STORAGE_KEYS, writeJson } from './storage'

/* ----------------------------------------------------------------------------
 * Records (internal shapes, never returned directly to the client)
 * ------------------------------------------------------------------------- */
export interface UserRecord {
  id: string
  name: string
  username: string
  email: string
  bio: string
  avatarUrl: string | null
  passwordHash: string
  salt: string
  createdAt: string
}

export interface SessionRecord {
  token: string
  userId: string
  createdAt: string
  expiresAt: string
}

export interface CartItemRecord {
  id: string
  nftId: string
  editionId: string
  quantity: number
  addedPriceEth: DecimalString
}

export interface CartRecord {
  id: string
  /** `user:<id>` or `guest:<id>` */
  ownerKey: string
  items: CartItemRecord[]
  couponCode: string | null
  updatedAt: string
  version: number
}

export interface QuoteRecord {
  quoteId: string
  quoteVersion: string
  ownerKey: string
  cartVersion: number
  network: NetworkId
  couponCode: string | null
  lines: QuoteLine[]
  coupon: QuoteCoupon | null
  subtotalEth: DecimalString
  discountEth: DecimalString
  networkFeeEth: DecimalString
  totalEth: DecimalString
  issuedAt: string
  expiresAt: string
}

export interface OrderRecord extends Order {
  userId: string
  idempotencyKey: string
  payloadHash: string
  /** When the simulated payment should settle (ms epoch). */
  settleAt: number | null
  settleOutcome: 'confirmed' | 'rejected' | 'pending'
  cartItemIds: string[]
}

export interface MockDb {
  schemaVersion: number
  seededAt: string
  users: UserRecord[]
  sessions: SessionRecord[]
  nfts: Nft[]
  favorites: Record<string, string[]>
  carts: CartRecord[]
  quotes: QuoteRecord[]
  orders: OrderRecord[]
  wallets: Record<string, Partial<Record<WalletKind, Wallet>>>
  coupons: CouponSeed[]
  eventSeq: number
}

const SCHEMA_VERSION = 5

let db: MockDb | null = null

/* ----------------------------------------------------------------------------
 * Seed
 * ------------------------------------------------------------------------- */
async function buildSeed(): Promise<MockDb> {
  const now = new Date().toISOString()
  const users: UserRecord[] = []
  const favorites: Record<string, string[]> = {}
  const wallets: MockDb['wallets'] = {}

  for (const seed of DEMO_USERS) {
    const salt = randomSalt()
    users.push({
      id: seed.id,
      name: seed.name,
      username: seed.username,
      email: seed.email,
      bio: seed.bio,
      avatarUrl: seed.avatarUrl,
      salt,
      passwordHash: await hashPassword(seed.password, salt),
      createdAt: now,
    })
    favorites[seed.id] = [...seed.favorites]
    wallets[seed.id] = {}
    for (const wallet of seed.wallets) {
      wallets[seed.id]![wallet.kind] = {
        id: randomId('wal'),
        kind: wallet.kind,
        label: wallet.label,
        address: wallet.address,
        network: wallet.network,
        createdAt: now,
        updatedAt: now,
      }
    }
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    seededAt: now,
    users,
    sessions: [],
    nfts: buildNftFixtures(),
    favorites,
    carts: [],
    quotes: [],
    orders: [],
    wallets,
    coupons: COUPONS,
    eventSeq: 0,
  }
}

/* ----------------------------------------------------------------------------
 * Lifecycle
 * ------------------------------------------------------------------------- */
export async function loadDb(): Promise<MockDb> {
  if (db) return db
  const stored = readJson<MockDb>(STORAGE_KEYS.db)
  if (stored && stored.schemaVersion === SCHEMA_VERSION) {
    db = stored
    return db
  }
  db = await buildSeed()
  persist()
  return db
}

export async function resetDb(): Promise<MockDb> {
  remove(STORAGE_KEYS.db)
  db = await buildSeed()
  persist()
  return db
}

export function getDb(): MockDb {
  if (!db) throw new Error('Mock database not loaded. Call loadDb() first.')
  return db
}

/** Writes the current state to localStorage. Called after every mutation. */
export function persist(): void {
  if (db) writeJson(STORAGE_KEYS.db, db)
}

export function nextEventId(): string {
  const current = getDb()
  current.eventSeq += 1
  persist()
  return `evt_${String(current.eventSeq).padStart(6, '0')}`
}
