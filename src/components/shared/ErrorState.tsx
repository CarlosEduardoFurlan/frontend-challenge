import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { toApiError } from '@/services/api/errors'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  error?: unknown
  title?: string
  description?: string
  onRetry?: () => void
  retrying?: boolean
  className?: string
}

/** Accessible error block with an explicit retry. Used for every failed query. */
export function ErrorState({
  error,
  title = 'Não foi possível carregar',
  description,
  onRetry,
  retrying = false,
  className,
}: ErrorStateProps) {
  const message = description ?? (error ? toApiError(error).message : undefined)

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 px-6 py-10 text-center',
        className,
      )}
      data-testid="error-state"
    >
      <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
      <h3 className="text-base font-semibold">{title}</h3>
      {message ? <p className="max-w-md text-sm text-muted-foreground">{message}</p> : null}
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} loading={retrying} className="mt-1">
          <RefreshCw aria-hidden="true" />
          Tentar novamente
        </Button>
      ) : null}
    </div>
  )
}
