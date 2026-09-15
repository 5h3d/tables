import type { Column } from '@tanstack/react-table'
import { cn } from '../../lib/utils'
import { columnLabel } from './columns'

const SortIcon = ({ dir }: { dir: false | 'asc' | 'desc' }) => {
  if (dir === 'asc')
    return (
      <svg viewBox="0 0 12 12" aria-hidden className="size-3">
        <path d="M6 10V2M3 5l3-3 3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  if (dir === 'desc')
    return (
      <svg viewBox="0 0 12 12" aria-hidden className="size-3">
        <path d="M6 2v8M3 7l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  return (
    <svg viewBox="0 0 12 12" aria-hidden className="size-3 text-faint">
      <path d="M4 4.5L6 2.5l2 2M4 7.5l2 2 2-2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DataTableColumnHeader<TData>({ column, className }: { column: Column<TData, unknown>; className?: string }) {
  const label = columnLabel(column)
  if (!column.getCanSort()) return <span className={className}>{label}</span>
  const dir = column.getIsSorted()
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        '-mx-1.5 inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-xs font-medium outline-none select-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/25',
        dir ? 'text-foreground' : 'text-muted-foreground',
        className,
      )}
    >
      {label}
      <SortIcon dir={dir} />
    </button>
  )
}

export function ariaSort(column: Column<unknown, unknown>): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.getCanSort()) return undefined
  const dir = column.getIsSorted()
  return dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'
}
