import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { pageRange } from '@/lib/data-table/pagination'
import { useDataTableContext } from './data-table-context'

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg viewBox="0 0 16 16" aria-hidden className="size-4">
    <path d={dir === 'left' ? 'M10 3.5L5.5 8l4.5 4.5' : 'M6 3.5L10.5 8 6 12.5'} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function PageButtons({ compact = false }: { compact?: boolean }) {
  const { instance } = useDataTableContext()
  const { table } = instance
  const page = table.getState().pagination.pageIndex + 1
  const pageCount = table.getPageCount()
  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        aria-label="Previous page"
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
        className={cn(compact && 'px-1.5')}
      >
        {compact ? <Chevron dir="left" /> : 'Previous'}
      </Button>
      {pageRange(page, pageCount).map((item, i) =>
        item === 'ellipsis' ? (
          <span key={`e${i}`} className="w-6 text-center text-muted-foreground" aria-hidden>
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? 'default' : 'outline'}
            size="sm"
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Page ${item}`}
            className="min-w-8 px-2"
            onClick={() => table.setPageIndex(item - 1)}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        variant="outline"
        size="sm"
        aria-label="Next page"
        disabled={!table.getCanNextPage()}
        onClick={() => table.nextPage()}
        className={cn(compact && 'px-1.5')}
      >
        {compact ? <Chevron dir="right" /> : 'Next'}
      </Button>
    </nav>
  )
}

function PageSizeSelect({ suffix }: { suffix: boolean }) {
  const { instance, pageSizeOptions } = useDataTableContext()
  const { table } = instance
  const size = table.getState().pagination.pageSize
  const options = pageSizeOptions.includes(size) ? pageSizeOptions : [...pageSizeOptions, size].sort((a, b) => a - b)
  return (
    <NativeSelect
      aria-label="Rows per page"
      value={size}
      onChange={(e) => table.setPageSize(Number(e.target.value))}
      className="h-8 [&>select]:h-8"
    >
      {options.map((n) => (
        <option key={n} value={n}>
          {n}
          {suffix ? ' / page' : ''}
        </option>
      ))}
    </NativeSelect>
  )
}

function Showing() {
  const { instance } = useDataTableContext()
  const { pageIndex, pageSize } = instance.table.getState().pagination
  const total = instance.total
  const start = total === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min(total, (pageIndex + 1) * pageSize)
  return (
    <span className="text-[13px] text-muted-foreground">
      Showing {start}–{end} of {total}
    </span>
  )
}

export function DataTablePagination({ className }: { className?: string }) {
  const { instance, layout } = useDataTableContext()
  const { table, status } = instance
  const page = table.getState().pagination.pageIndex + 1
  const pageCount = Math.max(1, table.getPageCount())
  const base = cn('border-t border-border', className)

  if (status === 'loading' || status === 'idle') {
    return (
      <div className={cn(base, 'flex items-center gap-3 px-5 py-3')} aria-hidden>
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-3 w-28 rounded-full" />
      </div>
    )
  }

  if (layout === 'mobile') {
    return (
      <div className={cn(base, 'flex flex-col gap-3 px-4 py-3')}>
        <div className="flex justify-center">
          <PageButtons compact />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <PageSizeSelect suffix />
          <Showing />
          <span className="ml-auto text-[13px] text-muted-foreground">
            Page {page} of {pageCount}
          </span>
        </div>
      </div>
    )
  }

  if (layout === 'tablet') {
    return (
      <div className={cn(base, 'flex flex-wrap items-center gap-3 px-4 py-3')}>
        <PageSizeSelect suffix />
        <Showing />
        <div className="ml-auto">
          <PageButtons />
        </div>
      </div>
    )
  }

  return (
    <div className={cn(base, 'flex flex-wrap items-center gap-3 px-5 py-3')}>
      <span className="text-[13px] text-muted-foreground">Rows per page</span>
      <PageSizeSelect suffix={false} />
      <Showing />
      <div className="ml-auto flex items-center gap-3">
        <span className="text-[13px] text-muted-foreground">
          Page {page} of {pageCount}
        </span>
        <PageButtons />
      </div>
    </div>
  )
}
