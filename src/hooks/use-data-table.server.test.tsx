import { act, renderHook, waitFor } from '@testing-library/react'
import type { ColumnDef } from '@tanstack/react-table'
import { useDataTable, type TableFetcher } from './use-data-table'
import { users, type User } from '@/demo/data'
import type { TableQuery } from '@/lib/data-table/query'

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status' },
]

/** In-memory server: applies the query to the users list. */
function serve(query: TableQuery) {
  let rows = users
  if (query.q) rows = rows.filter((u) => u.name.toLowerCase().includes(query.q!.toLowerCase()))
  for (const [id, values] of Object.entries(query.filters)) {
    rows = rows.filter((u) => values.includes(String(u[id as keyof User])))
  }
  if (query.sort) {
    const { id, desc } = query.sort
    rows = [...rows].sort((a, b) => String(a[id as keyof User]).localeCompare(String(b[id as keyof User])) * (desc ? -1 : 1))
  }
  const start = (query.page - 1) * query.pageSize
  return { rows: rows.slice(start, start + query.pageSize), total: rows.length }
}

const makeFetcher = (delay = 0): TableFetcher<User> & { calls: TableQuery[]; signals: AbortSignal[] } => {
  const calls: TableQuery[] = []
  const signals: AbortSignal[] = []
  const fetcher = ((query: TableQuery, signal: AbortSignal) => {
    calls.push(query)
    signals.push(signal)
    return new Promise<ReturnType<typeof serve>>((resolve) => setTimeout(() => resolve(serve(query)), delay))
  }) as TableFetcher<User> & { calls: TableQuery[]; signals: AbortSignal[] }
  fetcher.calls = calls
  fetcher.signals = signals
  return fetcher
}

describe('useDataTable · server mode', () => {
  it('fetches the first page on mount and exposes rows + total', async () => {
    const fetcher = makeFetcher()
    const { result } = renderHook(() => useDataTable({ mode: 'server', columns, fetcher }))
    expect(result.current.status).toBe('loading')
    expect(fetcher.calls[0]).toEqual({ page: 1, pageSize: 10, filters: {} })
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.total).toBe(78)
    expect(result.current.table.getRowModel().rows).toHaveLength(10)
    expect(result.current.table.getPageCount()).toBe(8)
    expect(result.current.table.getRowModel().rows[0].original.name).toBe('Amara Okafor')
  })

  it('re-fetches with the sort and keeps previous rows while fetching', async () => {
    const fetcher = makeFetcher(20)
    const { result } = renderHook(() => useDataTable({ mode: 'server', columns, fetcher }))
    await waitFor(() => expect(result.current.status).toBe('success'))
    act(() => result.current.table.getColumn('name')!.toggleSorting(true))
    expect(result.current.isFetching).toBe(true)
    expect(result.current.status).toBe('success')
    expect(result.current.table.getRowModel().rows).toHaveLength(10)
    await waitFor(() => expect(result.current.isFetching).toBe(false))
    expect(fetcher.calls.at(-1)).toMatchObject({ sort: { id: 'name', desc: true } })
    expect(result.current.table.getRowModel().rows[0].original.name > 'M').toBe(true)
  })

  it('aborts the previous request on rapid changes', async () => {
    const fetcher = makeFetcher(30)
    const { result } = renderHook(() => useDataTable({ mode: 'server', columns, fetcher }))
    act(() => result.current.table.setPageIndex(1))
    act(() => result.current.table.setPageIndex(2))
    expect(fetcher.signals[0].aborted).toBe(true)
    expect(fetcher.signals[1].aborted).toBe(true)
    expect(fetcher.signals[2].aborted).toBe(false)
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.query.page).toBe(3)
  })

  it('surfaces fetch errors and retries with refetch', async () => {
    let fail = true
    const fetcher: TableFetcher<User> = async (q) => {
      if (fail) throw new Error('504 Gateway Timeout')
      return serve(q)
    }
    const { result } = renderHook(() => useDataTable({ mode: 'server', columns, fetcher }))
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.error?.message).toBe('504 Gateway Timeout')
    fail = false
    act(() => result.current.refetch())
    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.total).toBe(78)
  })

  it('reads the initial query from the URL and writes changes back', async () => {
    window.history.replaceState(null, '', '/?page=2&sort=name.desc&other=1')
    const fetcher = makeFetcher()
    const { result } = renderHook(() => useDataTable({ mode: 'server', columns, fetcher, syncUrl: true }))
    expect(fetcher.calls[0]).toEqual({ page: 2, pageSize: 10, sort: { id: 'name', desc: true }, filters: {} })
    await waitFor(() => expect(result.current.status).toBe('success'))
    act(() => result.current.table.setPageSize(20))
    await waitFor(() => expect(result.current.isFetching).toBe(false))
    const sp = new URLSearchParams(window.location.search)
    expect(sp.get('other')).toBe('1')
    expect(sp.get('size')).toBe('20')
    expect(sp.get('sort')).toBe('name.desc')
    // page resets to 1 (a default) so it disappears from the URL
    expect(sp.get('page')).toBeNull()
    window.history.replaceState(null, '', '/')
  })

  it('select all marks every matching row without knowing their ids', async () => {
    const fetcher = makeFetcher()
    const { result } = renderHook(() => useDataTable({ mode: 'server', columns, fetcher }))
    await waitFor(() => expect(result.current.status).toBe('success'))
    act(() => result.current.selectAll())
    expect(result.current.selection).toEqual({ ids: [], all: true, count: 78 })
    act(() => result.current.table.getRowModel().rows[0].toggleSelected(true))
    expect(result.current.selection.all).toBe(false)
    expect(result.current.selection.count).toBe(1)
  })
})
