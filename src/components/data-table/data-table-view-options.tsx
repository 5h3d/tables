import * as React from 'react'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Popover } from '../ui/popover'
import { cn } from '../../lib/utils'
import { columnLabel } from './columns'
import { useDataTableContext } from './data-table-context'

/**
 * "Columns" button + popover to show / hide columns.
 * Columns opt out with `enableHiding: false`. Hidden columns disappear from
 * every layout, including mobile cards.
 */
export function DataTableViewOptions({ className }: { className?: string }) {
  const { instance, layout } = useDataTableContext()
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const columns = instance.table.getAllLeafColumns().filter((c) => c.getCanHide())
  if (columns.length === 0) return null

  const hiddenCount = columns.filter((c) => !c.getIsVisible()).length
  const compact = layout === 'mobile'

  return (
    <>
      <Button
        ref={triggerRef}
        variant="outline"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={compact ? 'Columns' : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(hiddenCount > 0 && 'border-primary/40 text-primary', compact && 'px-2.5', className)}
      >
        {compact ? (
          <svg viewBox="0 0 16 16" aria-hidden className="size-4">
            <path d="M2.5 3h11v10h-11zM6.5 3v10M10 3v10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        ) : (
          'Columns'
        )}
        {hiddenCount > 0 && ' '}
        {hiddenCount > 0 && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {hiddenCount}
          </span>
        )}
      </Button>
      <Popover open={open} onOpenChange={setOpen} anchorRef={triggerRef} role="dialog" aria-label="Columns" className="w-52 p-2">
        <p className="mb-1 px-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Show columns</p>
        {columns.map((col) => (
          <label key={col.id} className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-secondary">
            <Checkbox checked={col.getIsVisible()} aria-label={columnLabel(col)} onCheckedChange={(v) => col.toggleVisibility(v)} />
            <span>{columnLabel(col)}</span>
          </label>
        ))}
        {hiddenCount > 0 && (
          <div className="mt-1 border-t border-border pt-1">
            <Button
              variant="link"
              size="sm"
              className="w-full justify-start px-1.5"
              aria-label="Show all columns"
              onClick={() => instance.table.resetColumnVisibility()}
            >
              Show all
            </Button>
          </div>
        )}
      </Popover>
    </>
  )
}
