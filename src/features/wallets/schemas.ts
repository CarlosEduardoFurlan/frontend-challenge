import { z } from 'zod'

export const NETWORK_IDS = ['ethereum', 'polygon', 'arbitrum'] as const

export const walletAddressSchema = z
  .string()
  .trim()
  .regex(
    /^0x[a-fA-F0-9]{40}$/,
    'Endereço inválido. Use o formato 0x seguido de 40 caracteres hexadecimais.',
  )

export const walletSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, 'Dê um nome à carteira.')
    .max(40, 'O nome deve ter no máximo 40 caracteres.'),
  address: walletAddressSchema,
  network: z.enum(NETWORK_IDS, { message: 'Selecione uma rede.' }),
})
export type WalletInput = z.infer<typeof walletSchema>
