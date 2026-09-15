import * as React from 'react'
import { flexRender, type Column, type Row } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { cn } from '../../lib/utils'
import { foldedColumns, visibleColumns } from './columns'
import { ariaSort, DataTableColumnHeader } from './data-table-column-header'
import { useDataTableContext } from './data-table-context'
import { DataTableRowActions } from './data-table-row-actions'
import { DataTableRowCheckbox, DataTableSelectAll } from './data-table-select'
import { DataTableSkeletonRows } from './data-table-states'

const SELECT_COL_WIDTH = 44

const alignClass = (align?: 'left' | 'center' | 'right') =>
  align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : undefined

/**
 * The <table> renderer used on desktop, tablet (with folded columns) and
 * mobile "scroll" mode (horizontal scroll with sticky checkbox + pinned columns).
 */
export function DataTableGrid<TData>({ children }: { children?: React.ReactNode }) {
  const { instance, layout, mobile, selectable, rowActions, zebra } = useDataTableContext<TData>()
  const { table, status } = instance
  const scroll = layout === 'mobile' && mobile === 'scroll'
  const columns = visibleColumns(table, layout, mobile)
  const folded = foldedColumns(table, layout)
  const rows = table.getRowModel().rows
  const loading = status === 'loading' || status === 'idle'
  const hasActions = Boolean(rowActions)

  // Sticky offsets for mobile scroll: the checkbox column, then pinned columns.
  const stickyLeft = new Map<string, number>()
  if (scroll) {
    let left = selectable ? SELECT_COL_WIDTH : 0
    for (const col of columns) {
      if (col.columnDef.meta?.pinned === 'left') {
        stickyLeft.set(col.id, left)
        left += 160
      }
    }
  }
  const lastSticky = scroll ? Array.from(stickyLeft.keys()).at(-1) : undefined
  const stickyClass = (id: string | 'select', header: boolean) => {
    if (!scroll) return undefined
    const isSelect = id === 'select'
    if (!isSelect && !stickyLeft.has(id)) return undefined
    const isLast = isSelect ? stickyLeft.size === 0 : id === lastSticky
    return cn(
      'sticky z-10',
      header
        ? 'bg-muted'
        : cn('bg-card group-hover:bg-row-hover group-data-[state=selected]:bg-selection', zebra && 'group-even:bg-zebra'),
      isLast && 'after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-border after:shadow-[4px_0_8px_-2px_rgba(20,24,40,0.08)]',
    )
  }
  const stickyStyle = (id: string | 'select') => {
    if (!scroll) return undefined
    if (id === 'select') return { left: 0 }
    const left = stickyLeft.get(id)
    return left === undefined ? undefined : { left, minWidth: 160 }
  }

  const renderCell = (row: Row<TData>, col: Column<TData, unknown>) => {
    const cell = row.getAllCells().find((c) => c.column.id === col.id)
    if (!cell) return null
    const main = flexRender(cell.column.columnDef.cell, cell.getContext())
    const extra = folded.get(col.id)
    if (!extra?.length) return main
    return (
      <div className="flex flex-col gap-0.5">
        <div>{main}</div>
        {extra.map((fc) => {
          const fcell = row.getAllCells().find((c) => c.column.id === fc.id)
          return (
            <div key={fc.id} className="text-xs text-muted-foreground">
              {fcell ? flexRender(fcell.column.columnDef.cell, fcell.getContext()) : null}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('relative', scroll && 'overflow-x-auto')}>
      <Table className={cn(scroll && 'min-w-max')}>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {selectable && (
              <TableHead className={cn('w-11 pr-0', stickyClass('select', true))} style={stickyStyle('select')}>
                <DataTableSelectAll />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead
                key={col.id}
                aria-sort={ariaSort(col as Column<unknown, unknown>)}
                style={{ width: col.columnDef.meta?.width, ...stickyStyle(col.id) }}
                className={cn(alignClass(col.columnDef.meta?.align), stickyClass(col.id, true))}
              >
                <DataTableColumnHeader column={col} />
              </TableHead>
            ))}
            {hasActions && <TableHead className="w-12" aria-label="Actions" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <DataTableSkeletonRows columns={columns.length} selectable={selectable} actions={hasActions} />
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)}>{children}</td>
            </tr>
          ) : (
            rows.map((row) => {
              const selected = instance.selection.all || row.getIsSelected()
              return (
                <TableRow
                  key={row.id}
                  data-state={selected ? 'selected' : undefined}
                  className={cn('group hover:bg-row-hover', zebra && 'even:bg-zebra')}
                >
                  {selectable && (
                    <TableCell className={cn('w-11 pr-0', stickyClass('select', false))} style={stickyStyle('select')}>
                      <DataTableRowCheckbox row={row} />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      className={cn(alignClass(col.columnDef.meta?.align), stickyClass(col.id, false))}
                      style={stickyStyle(col.id)}
                    >
                      {renderCell(row, col)}
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell className="w-12 py-0 pr-3 pl-0 text-right">
                      <DataTableRowActions row={row} />
                    </TableCell>
                  )}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
