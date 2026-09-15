import * as React from 'react'
import type { Row } from '@tanstack/react-table'
import { Checkbox } from '../ui/checkbox'
import { Popover } from '../ui/popover'
import { cn } from '../../lib/utils'
import { useDataTableContext } from './data-table-context'

/** Header checkbox that cycles page selection, plus a caret menu with page / all / clear. */
export function DataTableSelectAll({ withMenu = true, label }: { withMenu?: boolean; label?: React.ReactNode }) {
  const { instance, entity } = useDataTableContext()
  const { table, selection } = instance
  const [open, setOpen] = React.useState(false)
  const caretRef = React.useRef<HTMLButtonElement>(null)

  const pageRows = table.getRowModel().rows
  const allPage = pageRows.length > 0 && table.getIsAllPageRowsSelected()
  const somePage = table.getIsSomePageRowsSelected()
  const checked = selection.all || allPage ? true : somePage || selection.count > 0 ? 'indeterminate' : false

  const onChange = (next: boolean) => {
    if (next && checked !== true) instance.selectPage()
    else instance.clearSelection()
  }

  const items = [
    { label: `Select page (${pageRows.length})`, onSelect: instance.selectPage },
    { label: `Select all ${instance.total}`, onSelect: instance.selectAll },
    { label: 'Clear selection', onSelect: instance.clearSelection, disabled: selection.count === 0 },
  ]

  return (
    <div className="flex items-center gap-1">
      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox checked={checked} onCheckedChange={onChange} aria-label={`Select all ${entity.plural} on this page`} />
        {label && <span className="text-[13px] font-medium text-foreground">{label}</span>}
      </label>
      {withMenu && (
        <>
          <button
            ref={caretRef}
            type="button"
            aria-label="Selection options"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className={cn(
              'inline-flex size-4 cursor-pointer items-center justify-center rounded text-faint outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/25',
              open && 'text-foreground',
            )}
          >
            <svg viewBox="0 0 12 12" aria-hidden className="size-2.5">
              <path d="M2 4l4 4 4-4" fill="currentColor" />
            </svg>
          </button>
          <Popover open={open} onOpenChange={setOpen} anchorRef={caretRef} align="start" role="menu" aria-label="Selection options" className="min-w-40">
            {items.map((item) => (
              <button
                key={String(item.label)}
                type="button"
                role="menuitem"
                tabIndex={-1}
                aria-disabled={item.disabled || undefined}
                onClick={() => {
                  if (item.disabled) return
                  setOpen(false)
                  item.onSelect()
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center rounded-md px-2.5 py-1.5 text-left outline-none hover:bg-secondary focus:bg-secondary',
                  item.disabled && 'cursor-not-allowed opacity-50',
                )}
              >
                {item.label}
              </button>
            ))}
          </Popover>
        </>
      )}
    </div>
  )
}

export function DataTableRowCheckbox<TData>({ row }: { row: Row<TData> }) {
  const { instance } = useDataTableContext<TData>()
  const checked = instance.selection.all || row.getIsSelected()
  return (
    <Checkbox
      checked={checked}
      disabled={!row.getCanSelect()}
      onCheckedChange={(next) => {
        if (instance.selection.all) {
          // Leaving "select all": keep the current page selected except this row.
          instance.selectPage()
          row.toggleSelected(false)
          return
        }
        row.toggleSelected(next)
      }}
      aria-label={`Select row ${row.index + 1}`}
      onClick={(e) => e.stopPropagation()}
    />
  )
}
