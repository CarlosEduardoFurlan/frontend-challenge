import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { dismissToast, useToasts } from '@/hooks/use-toast'

/**
 * Renders the toast queue. Radix handles `role="status"` + `aria-live` so screen readers
 * announce mutation feedback and realtime notifications without stealing focus.
 */
export function Toaster() {
  const toasts = useToasts()

  return (
    <ToastProvider swipeDirection="right" label="Notificações">
      {toasts.map(({ id, title, description, variant, duration, open }) => (
        <Toast
          key={id}
          variant={variant}
          duration={duration}
          open={open}
          onOpenChange={(isOpen) => {
            if (!isOpen) dismissToast(id)
          }}
          data-testid="toast"
          data-variant={variant ?? 'default'}
        >
          <div className="grid gap-1">
            {title ? <ToastTitle>{title}</ToastTitle> : null}
            {description ? <ToastDescription>{description}</ToastDescription> : null}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
