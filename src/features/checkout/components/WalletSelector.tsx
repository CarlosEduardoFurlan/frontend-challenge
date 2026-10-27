import { Link } from '@tanstack/react-router'
import { CheckCircle2, Loader2, Plug, PlugZap, XCircle } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { shortenAddress } from '@/lib/format'
import { NETWORK_LIST, NETWORKS } from '@/mocks/fixtures/networks'
import { cn } from '@/lib/utils'
import type { NetworkId, Wallet, WalletsResponse } from '@/types/api'

import type { WalletConnectionState } from '../hooks'

interface WalletSelectorProps {
  wallets: WalletsResponse
  walletId: string | null
  network: NetworkId
  connection: WalletConnectionState
  onWalletChange: (walletId: string) => void
  onNetworkChange: (network: NetworkId) => void
  onConnect: () => void
}

export function WalletSelector({
  wallets,
  walletId,
  network,
  connection,
  onWalletChange,
  onNetworkChange,
  onConnect,
}: WalletSelectorProps) {
  const list = [wallets.primary, wallets.secondary].filter((w): w is Wallet => Boolean(w))

  if (list.length === 0) {
    return (
      <Alert variant="warning" data-testid="no-wallets">
        <Plug aria-hidden="true" />
        <AlertDescription>
          Você ainda não cadastrou uma carteira.{' '}
          <Link
            to="/account/wallets"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Cadastrar carteira
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  const selected = list.find((w) => w.id === walletId) ?? null
  const connected = connection.status === 'connected'

  return (
    <div className="flex flex-col gap-5">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Carteira</legend>
        <RadioGroup
          value={walletId ?? ''}
          onValueChange={onWalletChange}
          aria-label="Carteira"
          data-testid="wallet-selector"
        >
          {list.map((wallet) => {
            const id = `wallet-${wallet.id}`
            return (
              <Label
                key={wallet.id}
                htmlFor={id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-3 font-normal transition-colors has-[[data-state=checked]]:border-primary',
                )}
                data-testid={`wallet-option-${wallet.kind}`}
              >
                <RadioGroupItem id={id} value={wallet.id} />
                <span className="flex flex-1 flex-col">
                  <span className="text-sm font-medium">{wallet.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {shortenAddress(wallet.address, 6)}
                  </span>
                </span>
                <Badge variant="outline">
                  {wallet.kind === 'primary' ? 'Principal' : 'Secundária'}
                </Badge>
              </Label>
            )
          })}
        </RadioGroup>
      </fieldset>

      <div className="grid gap-2 sm:max-w-xs">
        <Label htmlFor="checkout-network">Rede</Label>
        <NativeSelect
          id="checkout-network"
          value={network}
          onChange={(event) => onNetworkChange(event.target.value as NetworkId)}
          data-testid="network-select"
        >
          {NETWORK_LIST.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label} · taxa {item.feeEth} ETH
            </option>
          ))}
        </NativeSelect>
      </div>

      <div
        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
        data-testid="wallet-connection"
        data-status={connection.status}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            {connection.status === 'connected' ? (
              <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
            ) : connection.status === 'connecting' ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
            ) : connection.status === 'rejected' || connection.status === 'disconnected' ? (
              <XCircle className="size-4 text-destructive" aria-hidden="true" />
            ) : (
              <PlugZap className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
            <span role="status">
              {connection.status === 'connected'
                ? `Conectada a ${NETWORKS[connection.connection.network].label}`
                : connection.status === 'connecting'
                  ? 'Conectando à carteira…'
                  : connection.status === 'rejected'
                    ? `Recusada: ${connection.message}`
                    : connection.status === 'disconnected'
                      ? connection.message
                      : 'Carteira não conectada'}
            </span>
          </div>
          <Button
            type="button"
            variant={connected ? 'outline' : 'secondary'}
            size="sm"
            onClick={onConnect}
            disabled={!selected || connection.status === 'connecting'}
            loading={connection.status === 'connecting'}
            data-testid="connect-wallet"
          >
            {connected
              ? 'Reconectar'
              : connection.status === 'idle' || connection.status === 'connecting'
                ? 'Conectar carteira'
                : 'Tentar novamente'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Simulação: nenhuma extensão é usada. O resultado (conexão, recusa ou desconexão) depende
          do cenário ativo.
        </p>
      </div>
    </div>
  )
}
