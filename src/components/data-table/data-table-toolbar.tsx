import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useDataTableContext } from './data-table-context'
import { DataTableFilter } from './data-table-filter'
import { DataTableViewOptions } from './data-table-view-options'

export type DataTableSearchProps = { placeholder?: string; 'aria-label'?: string }

export type DataTableToolbarProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  /** Global search box; `false` hides it. */
  search?: DataTableSearchProps | false
  /** Show the built-in faceted Filter button (defaults to true when any column has `meta.filter`). */
  filter?: boolean
  /** Show the Columns (show / hide) button. Default true. */
  columns?: boolean
  /** Extra controls on the right (e.g. an "Add user" button). */
  actions?: React.ReactNode
  className?: string
}

function ResultCount() {
  const { instance, layout } = useDataTableContext()
  const { status, total, query } = instance
  if (status === 'error') return null
  if (status === 'loading' || status === 'idle') return <Skeleton className="h-3.5 w-10 rounded-full" />
  const filtered = Boolean(query.q) || Object.keys(query.filters).length > 0
  if (layout === 'mobile') return <span>{total}</span>
  return (
    <span>
      {total} {filtered ? (total === 1 ? 'result' : 'results') : 'total'}
    </span>
  )
}

export function DataTableToolbar({ title, description, search, filter, columns = true, actions, className }: DataTableToolbarProps) {
  const { instance, layout, entity } = useDataTableContext()
  const mobile = layout === 'mobile'
  const showFilter = filter ?? instance.table.getAllLeafColumns().some((c) => c.columnDef.meta?.filter)
  const searchProps: DataTableSearchProps | null = search === false ? null : (search ?? {})
  const placeholder = searchProps?.placeholder ?? `Search ${entity.plural}`

  const searchBox = searchProps && (
    <Input
      type="search"
      inputMode="search"
      value={instance.search}
      onChange={(e) => instance.setSearch(e.target.value)}
      placeholder={placeholder}
      aria-label={searchProps['aria-label'] ?? placeholder}
      className={cn(mobile ? 'w-full' : layout === 'tablet' ? 'w-40' : 'w-60')}
    />
  )

  return (
    <div className={cn('flex flex-col gap-3', mobile ? 'px-4 py-3' : 'px-5 py-4', className)}>
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {title && (
            <h2 className="truncate text-base leading-6 font-semibold text-foreground">{title}</h2>
          )}
          <span className="text-[13px] text-muted-foreground">
            <ResultCount />
          </span>
          {description && <p className="w-full text-[13px] text-muted-foreground">{description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!mobile && searchBox}
          {!mobile && columns && <DataTableViewOptions />}
          {!mobile && showFilter && <DataTableFilter />}
          {actions}
        </div>
      </div>
      {mobile && (searchBox || showFilter || columns) && (
        <div className="flex items-center gap-2">
          {searchBox}
          {columns && <DataTableViewOptions />}
          {showFilter && <DataTableFilter />}
        </div>
      )}
    </div>
  )
}
