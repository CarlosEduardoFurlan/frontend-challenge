import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
}

const KIND_LABELS: Record<WalletKind, string> = {
  primary: 'Carteira principal',
  secondary: 'Carteira secundária',
}

export function WalletForm({ kind, wallet, disabledReason }: WalletFormProps) {
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
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold">{KIND_LABELS[kind]}</h2>
        {wallet ? (
          <Badge variant="success">Cadastrada</Badge>
        ) : (
          <Badge variant="muted">Não cadastrada</Badge>
        )}
      </div>
      {wallet && !editing ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
          data-testid={`wallet-${kind}-edit`}
        >
          <Pencil aria-hidden="true" /> Editar
        </Button>
      ) : null}
    </div>
  )

  if (disabledReason && !wallet) {
    return (
      <section
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
        data-testid={`wallet-${kind}`}
      >
        {heading}
        <p className="text-sm text-muted-foreground">{disabledReason}</p>
      </section>
    )
  }

  if (wallet && !editing) {
    return (
      <section
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
        data-testid={`wallet-${kind}`}
      >
        {heading}
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-muted-foreground">Nome</dt>
          <dd className="font-medium" data-testid={`wallet-${kind}-label`}>
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
    <section
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
      data-testid={`wallet-${kind}`}
    >
      {heading}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
          data-testid={`wallet-${kind}-form`}
        >
          {formError ? (
            <Alert variant="destructive" data-testid="form-error">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          ) : null}
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da carteira</FormLabel>
                <FormControl>
                  <Input placeholder="Ex.: Carteira principal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0x…"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="font-mono"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Formato 0x seguido de 40 caracteres hexadecimais.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="network"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rede</FormLabel>
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
          <div className="flex justify-end gap-2">
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
            <Button type="submit" loading={upsert.isPending}>
              {wallet ? 'Salvar carteira' : 'Cadastrar carteira'}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}
