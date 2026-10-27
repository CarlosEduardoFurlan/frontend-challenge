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

/**
 * Figma "Pagination" (home frame): 35px squares with 4px radius and 8px gaps, right aligned.
 * The current page is filled with color/primary (18px bold ink), the others have a 1px
 * color/border outline; the chevron square is "Iconly/Curved/Arrow - Right 2".
 */
export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Paginação" className={cn('flex items-center justify-end gap-2', className)}>
      {page > 1 ? (
        <Button
          variant="outline"
          size="icon-sm"
          className="border-border text-foreground hover:bg-accent"
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <img
            src="/assets/icons/arrow-right-2.svg"
            alt=""
            width={12}
            height={7}
            className="rotate-90"
          />
        </Button>
      ) : null}
      <ol className="flex items-center gap-2">
        {pageWindow(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} className="px-1 text-muted-foreground" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <Button
                variant={item === page ? 'default' : 'outline'}
                size="icon-sm"
                className={cn(
                  'text-lg',
                  item === page ? 'font-bold' : 'border-border font-normal text-foreground',
                )}
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
      {page < totalPages ? (
        <Button
          variant="outline"
          size="icon-sm"
          className="border-border text-foreground hover:bg-accent"
          onClick={() => onPageChange(page + 1)}
          aria-label="Próxima página"
        >
          <img
            src="/assets/icons/arrow-right-2.svg"
            alt=""
            width={12}
            height={7}
            className="-rotate-90"
          />
        </Button>
      ) : null}
    </nav>
  )
}
