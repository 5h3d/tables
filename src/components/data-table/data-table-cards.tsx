import * as React from 'react'
import { flexRender, type Row } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { columnLabel } from './columns'
import { useDataTableContext } from './data-table-context'
import { DataTableRowActions } from './data-table-row-actions'
import { DataTableRowCheckbox } from './data-table-select'

/**
 * Mobile "cards" renderer. Each row becomes a list item composed from column
 * `meta.card` roles: title, subtitle, badge, meta (joined with " · "), body.
 */
export function DataTableCards<TData>() {
  const { instance, selectable, card, rowActions, zebra } = useDataTableContext<TData>()
  const rows = instance.table.getRowModel().rows
  const columns = instance.table.getAllLeafColumns().filter((c) => c.getIsVisible() && !c.columnDef.meta?.hideOn?.includes('mobile'))

  const byRole = (role: string) => columns.filter((c) => (c.columnDef.meta?.card ?? 'body') === role)
  const titleCols = byRole('title')
  const subtitleCols = byRole('subtitle')
  const badgeCols = byRole('badge')
  const metaCols = byRole('meta')
  const bodyCols = byRole('body')

  const value = (row: Row<TData>, colId: string) => {
    const cell = row.getAllCells().find((c) => c.column.id === colId)
    return cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : null
  }

  const renderBody = (row: Row<TData>) => {
    if (card) return card(row)
    return (
      <>
        {(titleCols.length > 0 || badgeCols.length > 0) && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {titleCols.map((c) => (
              <span key={c.id} className="text-sm font-semibold text-foreground">
                {value(row, c.id)}
              </span>
            ))}
            {badgeCols.map((c) => (
              <span key={c.id}>{value(row, c.id)}</span>
            ))}
          </div>
        )}
        {subtitleCols.map((c) => (
          <div key={c.id} className="mt-0.5 text-[13px] text-muted-foreground">
            {value(row, c.id)}
          </div>
        ))}
        {metaCols.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center text-xs whitespace-pre-wrap text-muted-foreground">
            {metaCols.map((c, i) => (
              <React.Fragment key={c.id}>
                {i > 0 && <span aria-hidden>{' · '}</span>}
                <span>
                  {c.columnDef.meta?.cardLabel ? `${c.columnDef.meta.cardLabel} ` : ''}
                  {value(row, c.id)}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
        {bodyCols.length > 0 && (
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
            {bodyCols.map((c) => (
              <React.Fragment key={c.id}>
                <dt className="text-muted-foreground">{columnLabel(c)}</dt>
                <dd className="min-w-0 text-foreground">{value(row, c.id)}</dd>
              </React.Fragment>
            ))}
          </dl>
        )}
      </>
    )
  }

  return (
    <ul role="list" className="divide-y divide-border">
      {rows.map((row) => {
        const selected = instance.selection.all || row.getIsSelected()
        return (
          <li
            key={row.id}
            data-state={selected ? 'selected' : undefined}
            className={cn(
              'flex items-start gap-3 px-4 py-3.5 data-[state=selected]:bg-selection',
              zebra && 'even:bg-zebra',
            )}
          >
            {selectable && (
              <div className="pt-0.5">
                <DataTableRowCheckbox row={row} />
              </div>
            )}
            <div className="min-w-0 flex-1">{renderBody(row)}</div>
            {rowActions && (
              <div className="-mt-1.5 -mr-2">
                <DataTableRowActions row={row} />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
