import { Link } from '@tanstack/react-router'
import { CheckCircle2, Loader2, Plug, XCircle } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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

/**
 * Figma "Carteira conectada" / "Carteira e rede" (mobile frame 16:748 and the desktop checkout):
 * wallet cards with a radio, bold label, address and network; then one option row per network
 * with a letter medallion and the radio on the right; finally the connection status/button.
 */
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
            className="font-bold text-text-accent underline underline-offset-4"
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
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 flex w-full items-center justify-between text-base font-bold">
          Carteira conectada
          <Link
            to="/account/wallets"
            className="text-sm font-bold text-text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            Trocar carteira
          </Link>
        </legend>
        <RadioGroup
          value={walletId ?? ''}
          onValueChange={onWalletChange}
          aria-label="Carteira"
          className="gap-3"
          data-testid="wallet-selector"
        >
          {list.map((wallet) => {
            const id = `wallet-${wallet.id}`
            return (
              <Label
                key={wallet.id}
                htmlFor={id}
                className={cn(
                  'flex cursor-pointer items-start gap-4 rounded-xl bg-card px-5 py-4 font-normal transition-colors has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-border-soft',
                )}
                data-testid={`wallet-option-${wallet.kind}`}
              >
                <RadioGroupItem id={id} value={wallet.id} className="mt-1" />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-base leading-5 font-bold">{wallet.label}</span>
                  <span className="font-mono text-[13px] leading-5 text-muted-foreground">
                    {shortenAddress(wallet.address, 6)}
                  </span>
                  <span className="text-[13px] leading-5 text-muted-foreground">
                    Rede {NETWORKS[wallet.network].label} ·{' '}
                    {wallet.kind === 'primary' ? 'Principal' : 'Reserva'}
                  </span>
                </span>
              </Label>
            )
          })}
        </RadioGroup>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-base font-bold">Carteira e rede</legend>
        <RadioGroup
          value={network}
          onValueChange={(value) => onNetworkChange(value as NetworkId)}
          aria-label="Rede"
          className="gap-3"
          data-testid="network-select"
        >
          {NETWORK_LIST.map((item) => {
            const id = `network-${item.id}`
            return (
              <Label
                key={item.id}
                htmlFor={id}
                className={cn(
                  'flex h-[60px] cursor-pointer items-center gap-4 rounded-xl border border-transparent bg-card px-4 font-normal transition-colors has-[[data-state=checked]]:border-border-soft lg:h-11 lg:rounded-md lg:border-border-soft lg:bg-transparent lg:has-[[data-state=checked]]:border-primary',
                )}
                data-testid={`network-option-${item.id}`}
              >
                <span
                  className="inline-flex size-9 items-center justify-center rounded-full bg-surface-dark text-sm font-bold text-text-accent lg:hidden"
                  aria-hidden="true"
                >
                  {item.label.charAt(0)}
                </span>
                <span className="flex-1 text-base">
                  {item.label}
                  <span className="ml-2 text-xs text-muted-foreground">taxa {item.feeEth} ETH</span>
                </span>
                <RadioGroupItem id={id} value={item.id} className="order-last lg:order-first" />
              </Label>
            )
          })}
        </RadioGroup>
      </fieldset>

      <div
        className="flex flex-col gap-3 rounded-xl bg-card p-4"
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
              <Plug className="size-4 text-muted-foreground" aria-hidden="true" />
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
            className="text-sm"
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
