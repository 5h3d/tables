import type { FilterFn, RowData } from '@tanstack/react-table'
import type { Layout } from '../../lib/data-table/responsive'

export type { Layout }
export type { TableQuery, SortSpec } from '../../lib/data-table/query'

export type DataTableStatus = 'idle' | 'loading' | 'success' | 'error'

export type SelectionState = {
  /** Explicitly selected row ids (empty when `all` is true) */
  ids: string[]
  /** Every row matching the current query is selected (server mode "select all N") */
  all: boolean
  /** Number of selected rows */
  count: number
}

/** Role a column plays when rows render as cards on mobile. */
export type CardRole = 'title' | 'subtitle' | 'badge' | 'meta' | 'body' | 'hidden'

export type FilterOption = { label: string; value: string }

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Plain-text label (used by the mobile sort select and card labels). Defaults to the header when it is a string. */
    label?: string
    /** Tablet layout: render this column's value inside the target column's cell as a second line. */
    foldInto?: string
    /** Hide the column entirely on these layouts. */
    hideOn?: Layout[]
    /** Mobile cards: where this column's value goes. Defaults to 'body'. */
    card?: CardRole
    /** Mobile cards: prefix for meta values, e.g. "Created" -> "Created Mar 4, 2026". */
    cardLabel?: string
    align?: 'left' | 'center' | 'right'
    /** CSS width for the header cell, e.g. "160px" or "20%". */
    width?: string
    /** Mobile scroll layout: keep this column sticky on the left. */
    pinned?: 'left'
    /** Faceted filter options; enables this column in the Filter popover and `filters` query. */
    filter?: { label?: string; options: FilterOption[] }
  }
}

declare module '@tanstack/react-table' {
  interface FilterFns {
    /** Faceted filter: keep the row when its value is one of the selected values. */
    oneOf: FilterFn<unknown>
  }
}
