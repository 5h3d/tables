import { NativeSelect } from '../ui/native-select'
import { columnLabel, sortableColumns } from './columns'
import { useDataTableContext } from './data-table-context'
import { DataTableSelectAll } from './data-table-select'

/** "Select all" + "Sort:" row shown above the mobile cards list. */
export function DataTableMobileControls() {
  const { instance, selectable } = useDataTableContext()
  const { table } = instance
  const columns = sortableColumns(table)
  const sort = table.getState().sorting[0]
  const current = sort ? `${sort.id}.${sort.desc ? 'desc' : 'asc'}` : ''

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5">
      {selectable ? <DataTableSelectAll label="Select all" /> : <span />}
      {columns.length > 0 && (
        <NativeSelect
          aria-label="Sort"
          value={current}
          onChange={(e) => {
            const v = e.target.value
            if (!v) return table.resetSorting()
            const dot = v.lastIndexOf('.')
            table.setSorting([{ id: v.slice(0, dot), desc: v.slice(dot + 1) === 'desc' }])
          }}
          className="h-8 max-w-[60%] [&>select]:h-8"
        >
          <option value="">Sort: none</option>
          {columns.flatMap((c) => [
            <option key={`${c.id}.asc`} value={`${c.id}.asc`}>
              Sort: {columnLabel(c)} ↑
            </option>,
            <option key={`${c.id}.desc`} value={`${c.id}.desc`}>
              Sort: {columnLabel(c)} ↓
            </option>,
          ])}
        </NativeSelect>
      )}
    </div>
  )
}
