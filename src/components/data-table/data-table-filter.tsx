import * as React from 'react'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Popover } from '../ui/popover'
import { cn } from '../../lib/utils'
import { columnLabel } from './columns'
import { useDataTableContext } from './data-table-context'

/**
 * Faceted "Filter" button + popover. Columns opt in with
 * `meta.filter = { options: [...] }`; selections flow through
 * `instance.setFilter` so they work in both client and server mode.
 */
export function DataTableFilter({ className }: { className?: string }) {
  const { instance, layout } = useDataTableContext()
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const columns = instance.table.getAllLeafColumns().filter((c) => c.columnDef.meta?.filter)
  if (columns.length === 0) return null

  const activeCount = Object.values(instance.query.filters).reduce((n, v) => n + v.length, 0)
  const compact = layout === 'mobile'

  return (
    <>
      <Button
        ref={triggerRef}
        variant="outline"
        size={compact ? 'md' : 'md'}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={compact ? 'Filter' : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(activeCount > 0 && 'border-primary/40 text-primary', compact && 'px-2.5', className)}
      >
        {compact ? (
          <svg viewBox="0 0 16 16" aria-hidden className="size-4">
            <path d="M2 3.5h12M4.5 8h7M7 12.5h2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          'Filter'
        )}
        {activeCount > 0 && ' '}
        {activeCount > 0 && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Button>
      <Popover
        open={open}
        onOpenChange={setOpen}
        anchorRef={triggerRef}
        role="dialog"
        aria-label="Filters"
        className="w-56 p-2"
      >
        {columns.map((col) => {
          const filter = col.columnDef.meta!.filter!
          const selected = instance.query.filters[col.id] ?? []
          return (
            <fieldset key={col.id} className="mb-2 last:mb-0">
              <legend className="mb-1 px-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {filter.label ?? columnLabel(col)}
              </legend>
              {filter.options.map((opt) => {
                const checked = selected.includes(opt.value)
                return (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-secondary"
                  >
                    <Checkbox
                      checked={checked}
                      aria-label={opt.label}
                      onCheckedChange={(next) =>
                        instance.setFilter(
                          col.id,
                          next ? [...selected, opt.value] : selected.filter((v) => v !== opt.value),
                        )
                      }
                    />
                    <span>{opt.label}</span>
                  </label>
                )
              })}
            </fieldset>
          )
        })}
        {activeCount > 0 && (
          <div className="mt-1 border-t border-border pt-1">
            <Button variant="link" size="sm" className="w-full justify-start px-1.5" onClick={() => instance.clearFilters()}>
              Clear filters
            </Button>
          </div>
        )}
      </Popover>
    </>
  )
}
