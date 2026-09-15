/**
 * Package entry point.
 *
 * The table itself:
 *   import { DataTable, useDataTable } from '@5h3d/tables'
 *   import '@5h3d/tables/styles.css'
 */
export { DataTable, type DataTableProps } from './components/data-table/data-table'
export { DataTableToolbar, type DataTableToolbarProps, type DataTableSearchProps } from './components/data-table/data-table-toolbar'
export { DataTableBulkBar, type BulkActionsRenderer } from './components/data-table/data-table-bulk-bar'
export { DataTableColumnHeader } from './components/data-table/data-table-column-header'
export { DataTableFilter } from './components/data-table/data-table-filter'
export { DataTableViewOptions } from './components/data-table/data-table-view-options'
export { DataTableGrid } from './components/data-table/data-table-grid'
export { DataTableCards } from './components/data-table/data-table-cards'
export { DataTableMobileControls } from './components/data-table/data-table-mobile-controls'
export { DataTablePagination } from './components/data-table/data-table-pagination'
export { DataTableRowActions } from './components/data-table/data-table-row-actions'
export { DataTableSelectAll, DataTableRowCheckbox } from './components/data-table/data-table-select'
export {
  DataTableEmpty,
  DataTableError,
  DataTableSkeletonRows,
  DataTableSkeletonCards,
  type EmptyStateRenderer,
  type ErrorStateRenderer,
} from './components/data-table/data-table-states'
export {
  useDataTableContext,
  DataTableProvider,
  type DataTableContextValue,
  type Density,
  type MobileMode,
  type Entity,
} from './components/data-table/data-table-context'
export { columnLabel, visibleColumns, foldedColumns, sortableColumns } from './components/data-table/columns'
export type {
  CardRole,
  DataTableStatus,
  FilterOption,
  Layout,
  SelectionState,
  SortSpec,
  TableQuery,
} from './components/data-table/types'

// The hook that drives it.
export {
  useDataTable,
  type DataTableInstance,
  type DataTableOptions,
  type ClientDataTableOptions,
  type ServerDataTableOptions,
  type DataTableInitialState,
  type TableFetcher,
  type TableFetcherResult,
} from './hooks/use-data-table'
export { useContainerWidth } from './hooks/use-container-width'
export { useDebouncedValue } from './hooks/use-debounced-value'

// Helpers, useful when wiring a backend or building your own footer.
export { pageRange, type PageItem } from './lib/data-table/pagination'
export { layoutFor, BREAKPOINTS } from './lib/data-table/responsive'
export { toSearchParams, fromSearchParams } from './lib/data-table/query'
export { cn } from './lib/utils'

// The small building blocks, for toolbar slots and bulk actions that match.
export { Badge, badgeVariants, type BadgeProps } from './components/ui/badge'
export { Button, buttonVariants, type ButtonProps } from './components/ui/button'
export { Checkbox, type CheckboxProps, type CheckedState } from './components/ui/checkbox'
export { Input } from './components/ui/input'
export { Menu, type MenuItem, type MenuProps } from './components/ui/menu'
export { NativeSelect } from './components/ui/native-select'
export { Popover, type PopoverProps } from './components/ui/popover'
export { Skeleton } from './components/ui/skeleton'
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'
