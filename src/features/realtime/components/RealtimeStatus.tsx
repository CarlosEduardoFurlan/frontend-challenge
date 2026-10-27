import { Wifi, WifiOff } from 'lucide-react'

import { cn } from '@/lib/utils'

import { useRealtimeStatus } from '../status-store'

/**
 * Discreet connection indicator. Only the disconnected/reconnecting states are announced,
 * so the user knows live prices may be stale and that data is reconciled on reconnection.
 */
export function RealtimeStatus({ className }: { className?: string }) {
  const status = useRealtimeStatus()
  const offline = status.state !== 'connected'

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex items-center justify-center gap-2 text-xs', className)}
      data-testid="realtime-status"
      data-state={status.state}
    >
      {offline ? (
        <>
          <WifiOff className="size-3.5 text-warning" aria-hidden="true" />
          <span>
            {status.state === 'connecting'
              ? 'Conectando ao tempo real…'
              : 'Conexão em tempo real interrompida. Reconectando…'}
          </span>
        </>
      ) : (
        <>
          <Wifi className="size-3.5 text-success" aria-hidden="true" />
          <span className="sr-only">Tempo real conectado</span>
        </>
      )}
    </div>
  )
}
