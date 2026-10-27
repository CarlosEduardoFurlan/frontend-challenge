import { http } from 'msw'

import { issuesToDetails } from '@/features/auth/schemas'
import { walletSchema } from '@/features/wallets/schemas'
import { env } from '@/lib/env'
import type { Wallet, WalletKind, WalletsResponse } from '@/types/api'

import { randomId } from '../lib/crypto'
import { httpError, json, readBody, requireUser, withScenario } from '../lib/http'
import { getDb, persist } from '../persistence/db'

function walletsOf(userId: string): WalletsResponse {
  const record = getDb().wallets[userId] ?? {}
  return { primary: record.primary ?? null, secondary: record.secondary ?? null }
}

function parseKind(value: string): WalletKind {
  if (value === 'primary' || value === 'secondary') return value
  throw httpError(404, 'not_found', 'Tipo de carteira inválido.')
}

export const walletsHandlers = [
  http.get(
    `${env.apiUrl}/wallets`,
    withScenario(({ request }) => {
      const { user } = requireUser(request)
      return json(walletsOf(user.id))
    }),
  ),

  /** Upsert: creates the wallet of that kind or updates it. */
  http.put(
    `${env.apiUrl}/wallets/:kind`,
    withScenario(async ({ request, params }) => {
      const { user } = requireUser(request)
      const kind = parseKind(String(params.kind))
      const parsed = walletSchema.safeParse(await readBody<unknown>(request))
      if (!parsed.success) {
        throw httpError(
          422,
          'validation_error',
          'Revise os campos destacados.',
          issuesToDetails(parsed.error),
        )
      }
      const db = getDb()
      const record = (db.wallets[user.id] ??= {})

      if (kind === 'secondary' && !record.primary) {
        throw httpError(
          422,
          'validation_error',
          'Cadastre a carteira principal antes da secundária.',
          {
            _: ['Cadastre a carteira principal antes da secundária.'],
          },
        )
      }
      const other = kind === 'primary' ? record.secondary : record.primary
      if (other && other.address.toLowerCase() === parsed.data.address.toLowerCase()) {
        throw httpError(409, 'conflict', 'Este endereço já está cadastrado na outra carteira.', {
          address: ['Este endereço já está cadastrado na outra carteira.'],
        })
      }

      const now = new Date().toISOString()
      const existing = record[kind]
      const wallet: Wallet = {
        id: existing?.id ?? randomId('wal'),
        kind,
        label: parsed.data.label,
        address: parsed.data.address,
        network: parsed.data.network,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      }
      record[kind] = wallet
      persist()
      return json(wallet, { status: existing ? 200 : 201 })
    }),
  ),
]
