import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FlaskConical } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { toast } from '@/hooks/use-toast'
import { env } from '@/lib/env'
import { queryKeys } from '@/lib/query-keys'
import { mockControlApi } from '@/services/api/mock-control'

/**
 * Floating panel available in every build with mocks enabled. It lets evaluators switch
 * scenarios, reset the simulated backend and fire realtime events without touching the code.
 * Everything goes through the `/api/__mock/*` endpoints served by MSW.
 */
export function MockPanel() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const status = useQuery({
    queryKey: queryKeys.mock.status,
    queryFn: mockControlApi.status,
    enabled: open,
    staleTime: 0,
  })

  const setScenario = useMutation({
    mutationFn: mockControlApi.setScenario,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.mock.status, data)
      toast({
        title: 'Cenário alterado',
        description: `Agora usando "${data.scenario}".`,
        variant: 'info',
      })
    },
  })

  const reset = useMutation({
    mutationFn: mockControlApi.reset,
    onSuccess: () => {
      toast({
        title: 'Dados simulados restaurados',
        description: 'A página será recarregada.',
        variant: 'info',
      })
      setTimeout(() => window.location.assign('/'), 400)
    },
  })

  const priceEvent = useMutation({
    mutationFn: () => mockControlApi.updatePrice('nft-001', 'nft-001-std', '0.09'),
    onSuccess: () =>
      toast({
        title: 'Evento nft.updated emitido',
        description: 'Preço de nft-001 alterado para 0,09 ETH.',
      }),
  })

  const settleOrders = useMutation({
    mutationFn: () => mockControlApi.settleOrders(),
    onSuccess: (data) =>
      toast({
        title: 'Pedidos pendentes liquidados',
        description: `${data.settled} pedido(s) atualizados.`,
      }),
  })

  const dropSockets = useMutation({
    mutationFn: () => mockControlApi.dropSockets(),
    onSuccess: (data) =>
      toast({
        title: 'Conexões encerradas',
        description: `${data.dropped} socket(s) fechados; o cliente reconecta sozinho.`,
      }),
  })

  const soldOutEvent = useMutation({
    mutationFn: () => mockControlApi.updateAvailability('nft-002', 'nft-002-std', 0),
    onSuccess: () =>
      toast({
        title: 'Evento nft.updated emitido',
        description: 'Edição padrão de nft-002 esgotada.',
      }),
  })

  if (!env.mocksEnabled) return null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-4 left-4 z-40 rounded-full border border-border shadow-card"
          aria-label="Abrir painel de cenários simulados"
          data-testid="mock-panel-trigger"
        >
          <FlaskConical aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col gap-6">
        <SheetHeader>
          <SheetTitle>Cenários simulados</SheetTitle>
          <SheetDescription>
            Backend simulado por MSW. Troque o cenário, restaure os dados ou dispare eventos em
            tempo real.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-2">
          <Label htmlFor="mock-scenario">Cenário ativo</Label>
          <NativeSelect
            id="mock-scenario"
            value={status.data?.scenario ?? ''}
            disabled={!status.data || setScenario.isPending}
            onChange={(e) => setScenario.mutate(e.target.value)}
            data-testid="mock-scenario-select"
          >
            {(status.data?.scenarios ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </NativeSelect>
          <p className="text-xs text-muted-foreground">
            {status.data?.scenarios.find((s) => s.id === status.data?.scenario)?.description}
          </p>
          <p className="text-xs text-muted-foreground">
            Também aceita <code>?mock-scenario=&lt;id&gt;</code> e <code>?mock-reset</code> na URL.
          </p>
        </div>

        <div className="grid gap-2">
          <h3 className="text-sm font-semibold">Eventos Socket.IO</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => priceEvent.mutate()}
            loading={priceEvent.isPending}
          >
            nft.updated: preço de nft-001 → 0,09 ETH
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => soldOutEvent.mutate()}
            loading={soldOutEvent.isPending}
          >
            nft.updated: esgotar edição padrão de nft-002
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => settleOrders.mutate()}
            loading={settleOrders.isPending}
          >
            order.updated: liquidar pedidos pendentes agora
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dropSockets.mutate()}
            loading={dropSockets.isPending}
          >
            Interromper conexão Socket.IO
          </Button>
          <p className="text-xs text-muted-foreground">
            Sockets conectados: {status.data?.connectedSockets ?? '–'}
          </p>
        </div>

        <div className="mt-auto grid gap-2">
          <Button
            variant="destructive"
            onClick={() => reset.mutate()}
            loading={reset.isPending}
            data-testid="mock-reset"
          >
            Restaurar dados simulados
          </Button>
          <p className="text-xs text-muted-foreground">
            Semente atual:{' '}
            {status.data ? new Date(status.data.seededAt).toLocaleString('pt-BR') : '–'}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
