import { FlaskConical } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'

import { Button } from '@/components/ui/button'
import { env } from '@/lib/env'

// The drawer (Radix Dialog) and its controls are only needed after a click, so they stay out
// of the initial bundle; the floating trigger is the only eager part.
const MockPanelSheet = lazy(() => import('./MockPanelSheet'))

/**
 * Floating panel available in every build with mocks enabled. It lets evaluators switch
 * scenarios, reset the simulated backend and fire realtime events without touching the code.
 * Everything goes through the `/api/__mock/*` endpoints served by MSW.
 */
export function MockPanel() {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (!env.mocksEnabled) return null

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        className="fixed bottom-24 left-4 z-40 rounded-full border border-border shadow-card lg:bottom-4"
        aria-label="Abrir painel de cenários simulados"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setLoaded(true)
          setOpen(true)
        }}
        data-testid="mock-panel-trigger"
      >
        <FlaskConical aria-hidden="true" />
      </Button>
      {loaded ? (
        <Suspense fallback={null}>
          <MockPanelSheet open={open} onOpenChange={setOpen} />
        </Suspense>
      ) : null}
    </>
  )
}
