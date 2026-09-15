import type { Row } from '@tanstack/react-table'
import { Menu } from '@/components/ui/menu'
import { useDataTableContext } from './data-table-context'

export function DataTableRowActions<TData>({ row }: { row: Row<TData> }) {
  const { rowActions } = useDataTableContext<TData>()
  if (!rowActions) return null
  const items = rowActions(row)
  if (items.length === 0) return null
  return <Menu label={`Row ${row.index + 1} actions`} items={items} />
}
