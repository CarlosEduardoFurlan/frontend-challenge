import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { applyApiErrors } from '@/features/auth/apply-api-errors'
import { formatDateTime, shortenAddress } from '@/lib/format'
import { NETWORK_LIST, NETWORKS } from '@/mocks/fixtures/networks'
import type { Wallet, WalletKind } from '@/types/api'

import { useUpsertWallet } from '../hooks'
import { walletSchema, type WalletInput } from '../schemas'

interface WalletFormProps {
  kind: WalletKind
  wallet: Wallet | null
  /** Secondary wallets cannot be created before the primary one. */
  disabledReason?: string
  headingLevel?: 'h1' | 'h2'
  description?: string
}

const KIND_LABELS: Record<WalletKind, string> = {
  primary: 'Carteira principal',
  secondary: 'Carteira secundária',
}

/**
 * Figma wallet block: 20px bold title with an "Adicionar" link on the right, a 14px
 * text-secondary description, a two-column form (labels with asterisks, bordered fields)
 * and the "Salvar carteira" button. A saved wallet is summarised as a definition list.
 */
export function WalletForm({
  kind,
  wallet,
  disabledReason,
  headingLevel: Heading = 'h2',
  description,
}: WalletFormProps) {
  const upsert = useUpsertWallet()
  const [editing, setEditing] = useState(!wallet)
  const [formError, setFormError] = useState<string | null>(null)
  const form = useForm<WalletInput>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      label: wallet?.label ?? '',
      address: wallet?.address ?? '',
      network: wallet?.network ?? 'ethereum',
    },
    mode: 'onTouched',
  })

  async function onSubmit(values: WalletInput) {
    setFormError(null)
    try {
      const saved = await upsert.mutateAsync({ kind, body: values })
      form.reset({ label: saved.label, address: saved.address, network: saved.network })
      setEditing(false)
    } catch (error) {
      setFormError(applyApiErrors(error, form.setError, ['label', 'address', 'network']))
    }
  }

  const heading = (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Heading className="text-xl leading-tight font-bold">{KIND_LABELS[kind]}</Heading>
        {wallet && !editing ? (
          <Button
            type="button"
            variant="link"
            className="text-base"
            onClick={() => setEditing(true)}
            data-testid={`wallet-${kind}-edit`}
          >
            Editar
          </Button>
        ) : null}
      </div>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  )

  if (disabledReason && !wallet) {
    return (
      <section className="flex flex-col gap-3" data-testid={`wallet-${kind}`}>
        {heading}
        <p className="text-sm text-muted-foreground">{disabledReason}</p>
      </section>
    )
  }

  if (wallet && !editing) {
    return (
      <section className="flex flex-col gap-4" data-testid={`wallet-${kind}`}>
        {heading}
        <dl className="grid gap-x-6 gap-y-3 rounded-lg bg-card p-5 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-muted-foreground">Nome</dt>
          <dd className="font-bold" data-testid={`wallet-${kind}-label`}>
            {wallet.label}
          </dd>
          <dt className="text-muted-foreground">Endereço</dt>
          <dd className="font-mono break-all" title={wallet.address}>
            {shortenAddress(wallet.address, 6)}
          </dd>
          <dt className="text-muted-foreground">Rede</dt>
          <dd>{NETWORKS[wallet.network].label}</dd>
          <dt className="text-muted-foreground">Atualizada em</dt>
          <dd>{formatDateTime(wallet.updatedAt)}</dd>
        </dl>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-6" data-testid={`wallet-${kind}`}>
      {heading}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
          noValidate
          data-testid={`wallet-${kind}-form`}
        >
          {formError ? (
            <Alert variant="destructive" data-testid="form-error">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}
          <div className="grid gap-x-7 gap-y-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nome da carteira</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex.: Carteira principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="network"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Rede</FormLabel>
                  <FormControl>
                    <NativeSelect {...field}>
                      {NETWORK_LIST.map((network) => (
                        <option key={network.id} value={network.id}>
                          {network.label}
                        </option>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel required>Endereço</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Endereço 0x da carteira"
                      autoCapitalize="none"
                      spellCheck={false}
                      className="font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Formato 0x seguido de 40 caracteres hexadecimais.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" loading={upsert.isPending}>
              {wallet ? 'Salvar carteira' : 'Cadastrar carteira'}
            </Button>
            {wallet ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.reset()
                  setFormError(null)
                  setEditing(false)
                }}
              >
                Cancelar
              </Button>
            ) : null}
          </div>
        </form>
      </Form>
    </section>
  )
}
