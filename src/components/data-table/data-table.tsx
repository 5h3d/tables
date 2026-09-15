import * as React from 'react'
import type { Row } from '@tanstack/react-table'
import type { MenuItem } from '@/components/ui/menu'
import type { DataTableInstance } from '@/hooks/use-data-table'
import { useContainerWidth } from '@/hooks/use-container-width'
import { layoutFor } from '@/lib/data-table/responsive'
import { cn } from '@/lib/utils'
import { DataTableBulkBar, type BulkActionsRenderer } from './data-table-bulk-bar'
import { DataTableCards } from './data-table-cards'
import { DataTableProvider, type Density, type Entity, type MobileMode } from './data-table-context'
import { DataTableGrid } from './data-table-grid'
import { DataTableMobileControls } from './data-table-mobile-controls'
import { DataTablePagination } from './data-table-pagination'
import {
  DataTableEmpty,
  DataTableError,
  DataTableSkeletonCards,
  type EmptyStateRenderer,
  type ErrorStateRenderer,
} from './data-table-states'
import { DataTableToolbar, type DataTableToolbarProps } from './data-table-toolbar'
import type { Layout } from './types'

const ROW_PADDING: Record<Density, string> = { compact: '8px', comfortable: '12px', spacious: '18px' }

export type DataTableProps<TData> = Omit<DataTableToolbarProps, 'className'> & {
  instance: DataTableInstance<TData>
  /** Copy for counts and states: "78 users", "No users match…". Defaults to rows. */
  entity?: Entity
  /** Force a layout instead of measuring the container. */
  layout?: 'auto' | Layout
  /** How rows render below the tablet breakpoint. Default "cards". */
  mobile?: MobileMode
  density?: Density
  zebra?: boolean
  /** Hide the checkbox column even if the instance allows selection. */
  selectable?: boolean
  bulkActions?: BulkActionsRenderer
  rowActions?: (row: Row<TData>) => MenuItem[]
  /** Custom card body for mobile cards (replaces the role-based layout). */
  card?: (row: Row<TData>) => React.ReactNode
  emptyState?: EmptyStateRenderer
  errorState?: ErrorStateRenderer
  /** Secondary action shown next to Retry in the error state. */
  errorSupport?: React.ReactNode
  pageSizeOptions?: number[]
  /** Hide the pagination footer. */
  pagination?: boolean
  className?: string
  children?: React.ReactNode
}

export function DataTable<TData>({
  instance,
  entity = { singular: 'row', plural: 'rows' },
  layout: layoutProp = 'auto',
  mobile = 'cards',
  density = 'comfortable',
  zebra = false,
  selectable,
  bulkActions,
  rowActions,
  card,
  emptyState,
  errorState,
  errorSupport,
  pageSizeOptions = [10, 20, 50],
  pagination = true,
  title,
  description,
  search,
  filter,
  columns,
  actions,
  className,
  children,
}: DataTableProps<TData>) {
  const ref = React.useRef<HTMLDivElement>(null)
  const width = useContainerWidth(ref)
  const layout: Layout = layoutProp === 'auto' ? (width === null ? 'desktop' : layoutFor(width)) : layoutProp
  const canSelect = selectable ?? instance.table.options.enableRowSelection !== false
  const { status } = instance
  const rows = instance.table.getRowModel().rows
  const loading = status === 'loading' || status === 'idle'
  const isCards = layout === 'mobile' && mobile === 'cards'
  const empty = !loading && status !== 'error' && rows.length === 0

  return (
    <DataTableProvider
      value={{ instance, layout, mobile, density, zebra, entity, selectable: canSelect, rowActions, card, pageSizeOptions }}
    >
      <div
        ref={ref}
        data-slot="data-table"
        data-layout={layout}
        data-density={density}
        style={{ '--dt-row-py': ROW_PADDING[density] } as React.CSSProperties}
        className={cn(
          'flex flex-col overflow-hidden bg-card text-foreground shadow-card',
          layout === 'mobile' ? 'rounded-xl' : 'rounded-lg',
          className,
        )}
      >
        <DataTableToolbar title={title} description={description} search={search} filter={filter} columns={columns} actions={actions} />
        {status !== 'error' && <DataTableBulkBar actions={bulkActions} />}
        {children}
        {status === 'error' ? (
          <div className="border-t border-border">
            <DataTableError render={errorState} support={errorSupport} />
          </div>
        ) : isCards ? (
          <>
            {!empty && <DataTableMobileControls />}
            <div className="border-t border-border">
              {loading ? <DataTableSkeletonCards selectable={canSelect} /> : empty ? <DataTableEmpty render={emptyState} /> : <DataTableCards<TData> />}
            </div>
          </>
        ) : (
          <DataTableGrid<TData>>
            <DataTableEmpty render={emptyState} />
          </DataTableGrid>
        )}
        {pagination && status !== 'error' && !empty && <DataTablePagination />}
      </div>
    </DataTableProvider>
  )
}
