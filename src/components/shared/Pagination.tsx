import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function pageWindow(page: number, totalPages: number): Array<number | 'gap'> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  const result: Array<number | 'gap'> = []
  sorted.forEach((p, index) => {
    const prev = sorted[index - 1]
    if (prev !== undefined && p - prev > 1) result.push('gap')
    result.push(p)
  })
  return result
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Paginação" className={cn('flex items-center justify-center gap-1', className)}>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft aria-hidden="true" />
      </Button>
      <ol className="flex items-center gap-1">
        {pageWindow(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} className="px-1 text-muted-foreground" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <Button
                variant={item === page ? 'default' : 'ghost'}
                size="icon-sm"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Página ${item}`}
              >
                {item}
              </Button>
            </li>
          ),
        )}
      </ol>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Próxima página"
      >
        <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  )
}
