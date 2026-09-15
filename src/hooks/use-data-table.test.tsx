import { act, renderHook } from '@testing-library/react'
import type { ColumnDef } from '@tanstack/react-table'
import { useDataTable } from './use-data-table'
import { users, type User } from '@/demo/data'

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status', meta: { filter: { options: [] } } },
  { accessorKey: 'createdAt', header: 'Date created' },
]

describe('useDataTable · client mode', () => {
  it('paginates in memory with the initial page size', () => {
    const { result } = renderHook(() => useDataTable({ mode: 'client', data: users, columns }))
    expect(result.current.total).toBe(78)
    expect(result.current.table.getPageCount()).toBe(8)
    expect(result.current.table.getRowModel().rows).toHaveLength(10)
    expect(result.current.query).toEqual({ page: 1, pageSize: 10, filters: {} })
    expect(result.current.status).toBe('success')
  })

  it('sorts by a column and reports the sort in the query', () => {
    const { result } = renderHook(() => useDataTable({ mode: 'client', data: users, columns }))
    act(() => result.current.table.getColumn('name')!.toggleSorting(false))
    const names = result.current.table.getRowModel().rows.map((r) => r.original.name)
    expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names)
    expect(result.current.query.sort).toEqual({ id: 'name', desc: false })
  })

  it('filters with a debounced global search and resets to page 1', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useDataTable({ mode: 'client', data: users, columns }))
    act(() => result.current.table.setPageIndex(3))
    act(() => result.current.setSearch('quantum'))
    expect(result.current.search).toBe('quantum')
    expect(result.current.query.q).toBeUndefined()
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.query).toMatchObject({ page: 1, q: 'quantum' })
    expect(result.current.total).toBe(0)
    act(() => result.current.setSearch('okafor'))
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current.total).toBe(1)
    vi.useRealTimers()
  })

  it('applies faceted column filters', () => {
    const { result } = renderHook(() => useDataTable({ mode: 'client', data: users, columns }))
    act(() => result.current.setFilter('status', ['suspended']))
    expect(result.current.total).toBe(users.filter((u) => u.status === 'suspended').length)
    expect(result.current.query.filters).toEqual({ status: ['suspended'] })
    act(() => result.current.setFilter('status', []))
    expect(result.current.total).toBe(78)
  })

  it('tracks selection, select page, select all and clear', () => {
    const { result } = renderHook(() => useDataTable({ mode: 'client', data: users, columns }))
    act(() => result.current.table.getRowModel().rows[0].toggleSelected(true))
    expect(result.current.selection).toEqual({ ids: ['u_001'], all: false, count: 1 })
    act(() => result.current.selectPage())
    expect(result.current.selection.count).toBe(10)
    act(() => result.current.selectAll())
    expect(result.current.selection.count).toBe(78)
    expect(result.current.selection.all).toBe(true)
    act(() => result.current.clearSelection())
    expect(result.current.selection.count).toBe(0)
  })

  it('mirrors external loading and error flags into status', () => {
    const { result, rerender } = renderHook(
      (props: { isLoading?: boolean; error?: Error | null }) =>
        useDataTable({ mode: 'client', data: [], columns, ...props }),
      { initialProps: { isLoading: true } as { isLoading?: boolean; error?: Error | null } },
    )
    expect(result.current.status).toBe('loading')
    rerender({ error: new Error('boom') })
    expect(result.current.status).toBe('error')
    expect(result.current.error?.message).toBe('boom')
  })
})

describe('useDataTable · column visibility', () => {
  it('starts with hidden columns and exposes visibility on the table', () => {
    const { result } = renderHook(() =>
      useDataTable({ mode: 'client', data: users, columns, initialState: { hiddenColumns: ['email'] } }),
    )
    expect(result.current.table.getColumn('email')!.getIsVisible()).toBe(false)
    act(() => result.current.table.getColumn('email')!.toggleVisibility(true))
    expect(result.current.table.getColumn('email')!.getIsVisible()).toBe(true)
  })
})
