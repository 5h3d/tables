import type { Column, Table } from '@tanstack/react-table'
import type { Layout } from './types'
import type { MobileMode } from './data-table-context'

/** Plain-text label for a column: `meta.label`, then a string header, then the id. */
export function columnLabel<TData>(column: Column<TData, unknown>): string {
  const meta = column.columnDef.meta
  if (meta?.label) return meta.label
  const header = column.columnDef.header
  return typeof header === 'string' ? header : column.id
}

/** Leaf columns that get their own cell in the given layout. */
export function visibleColumns<TData>(table: Table<TData>, layout: Layout, mobile: MobileMode): Column<TData, unknown>[] {
  return table.getAllLeafColumns().filter((col) => {
    if (!col.getIsVisible()) return false
    const meta = col.columnDef.meta
    if (meta?.hideOn?.includes(layout)) return false
    if (layout === 'tablet' && meta?.foldInto) return false
    if (layout === 'mobile' && mobile === 'scroll' && meta?.foldInto && meta.card === 'hidden') return false
    return true
  })
}

/** Tablet: columns folded under another column, keyed by the target column id. */
export function foldedColumns<TData>(table: Table<TData>, layout: Layout): Map<string, Column<TData, unknown>[]> {
  const map = new Map<string, Column<TData, unknown>[]>()
  if (layout !== 'tablet') return map
  for (const col of table.getAllLeafColumns()) {
    const target = col.columnDef.meta?.foldInto
    if (!target || !col.getIsVisible()) continue
    if (col.columnDef.meta?.hideOn?.includes(layout)) continue
    map.set(target, [...(map.get(target) ?? []), col])
  }
  return map
}

/** Columns that can drive sorting (for the mobile sort select). */
export function sortableColumns<TData>(table: Table<TData>): Column<TData, unknown>[] {
  return table.getAllLeafColumns().filter((col) => col.getCanSort() && col.getIsVisible())
}
