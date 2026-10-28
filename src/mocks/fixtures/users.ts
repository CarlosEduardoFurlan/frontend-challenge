import type { NetworkId, WalletKind } from '@/types/api'

/**
 * Demo accounts. Passwords are only present here as plain text for documentation; the
 * mock database stores salted SHA-256 hashes computed at seed time.
 */
export interface UserSeed {
  id: string
  name: string
  username: string
  email: string
  password: string
  bio: string
  avatarUrl: string | null
  wallets: Array<{ kind: WalletKind; label: string; address: string; network: NetworkId }>
  favorites: string[]
}

export const DEMO_USERS: UserSeed[] = [
  {
    id: 'user-ana',
    name: 'Ana Ribeiro',
    username: 'ana.ribeiro',
    email: 'ana@example.com',
    password: 'Senha@123',
    bio: 'Colecionadora de arte generativa desde 2021.',
    avatarUrl: '/avatars/user-1.webp',
    wallets: [
      {
        kind: 'primary',
        label: 'Carteira principal',
        address: '0x1A2b3C4d5E6f7A8b9C0d1E2f3A4b5C6d7E8f9A0b',
        network: 'ethereum',
      },
      {
        kind: 'secondary',
        label: 'Polygon reserva',
        address: '0x9f8E7d6C5b4A39281706f5E4d3C2b1A0f9E8d7C6',
        network: 'polygon',
      },
    ],
    favorites: ['nft-002', 'nft-005'],
  },
  {
    id: 'user-bruno',
    name: 'Bruno Carvalho',
    username: 'bruno.c',
    email: 'bruno@example.com',
    password: 'Senha@123',
    bio: '',
    avatarUrl: null,
    wallets: [],
    favorites: [],
  },
]
