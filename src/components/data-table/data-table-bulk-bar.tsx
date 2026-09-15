import * as React from 'react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import type { SelectionState } from './types'
import { useDataTableContext } from './data-table-context'

export type BulkActionsRenderer = (selection: SelectionState, helpers: { clear: () => void }) => React.ReactNode

export function DataTableBulkBar({ actions, className }: { actions?: BulkActionsRenderer; className?: string }) {
  const { instance, layout } = useDataTableContext()
  const { selection } = instance
  if (selection.count === 0) return null
  const mobile = layout === 'mobile'
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className={cn(
        'flex items-center gap-2 border-t border-border bg-selection-strong',
        mobile ? 'px-4 py-2' : 'px-5 py-2.5',
        className,
      )}
    >
      <span className="mr-1 text-[13px] font-semibold text-primary">
        {selection.count} selected
      </span>
      {actions?.(selection, { clear: instance.clearSelection })}
      <Button variant="link" size="sm" className="ml-auto" onClick={instance.clearSelection}>
        {mobile ? 'Clear' : 'Clear selection'}
      </Button>
    </div>
  )
}
