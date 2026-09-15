import * as React from 'react'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type VisibilityState,
  type FilterFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table,
  type Updater,
} from '@tanstack/react-table'
import { fromSearchParams, toSearchParams, type SortSpec, type TableQuery } from '@/lib/data-table/query'
import type { DataTableStatus, SelectionState } from '@/components/data-table/types'
import { useDebouncedValue } from './use-debounced-value'

export type TableFetcherResult<TData> = { rows: TData[]; total: number }
export type TableFetcher<TData> = (query: TableQuery, signal: AbortSignal) => Promise<TableFetcherResult<TData>>

export type DataTableInitialState = {
  page?: number
  pageSize?: number
  sort?: SortSpec
  q?: string
  filters?: Record<string, string[]>
  /** Column ids hidden until the user shows them (see the Columns button). */
  hiddenColumns?: string[]
}

type BaseOptions<TData> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[]
  /** Stable row id; defaults to `row.id` and falls back to the row index. */
  getRowId?: (row: TData, index: number) => string
  initialState?: DataTableInitialState
  /** Mirror page / size / sort / q / filters into `location.search`. */
  syncUrl?: boolean
  /** Delay before a typed search reaches the query. Default 250ms. */
  searchDebounceMs?: number
  enableRowSelection?: boolean
}

export type ClientDataTableOptions<TData> = BaseOptions<TData> & {
  mode: 'client'
  data: TData[]
  /** Pass through from your own data loading (e.g. react-query) to drive the loading state. */
  isLoading?: boolean
  error?: Error | null
}

export type ServerDataTableOptions<TData> = BaseOptions<TData> & {
  mode: 'server'
  fetcher: TableFetcher<TData>
  /** Keep showing the previous page while the next one loads. Default true. */
  keepPreviousData?: boolean
}

export type DataTableOptions<TData> = ClientDataTableOptions<TData> | ServerDataTableOptions<TData>

export type DataTableInstance<TData> = {
  table: Table<TData>
  mode: 'client' | 'server'
  status: DataTableStatus
  /** True while a server request is in flight (even when previous rows are still shown). */
  isFetching: boolean
  error: Error | null
  /** Re-run the current query (server mode). No-op in client mode. */
  refetch: () => void
  query: TableQuery
  /** Rows matching the current query (all pages). */
  total: number
  /** Raw search input value (debounced into `query.q`). */
  search: string
  setSearch: (value: string) => void
  setFilter: (columnId: string, values: string[]) => void
  clearFilters: () => void
  selection: SelectionState
  selectPage: () => void
  selectAll: () => void
  clearSelection: () => void
}

const DEFAULT_PAGE_SIZE = 10

const oneOf: FilterFn<unknown> = (row, columnId, filterValue: unknown) => {
  const values = Array.isArray(filterValue) ? (filterValue as string[]) : []
  if (values.length === 0) return true
  return values.includes(String(row.getValue(columnId)))
}

function defaultGetRowId<TData>(row: TData, index: number): string {
  const id = (row as { id?: unknown })?.id
  return id !== undefined && id !== null ? String(id) : String(index)
}

function readInitialQuery(initial: DataTableInitialState | undefined, syncUrl: boolean): TableQuery {
  const defaults: TableQuery = {
    page: initial?.page ?? 1,
    pageSize: initial?.pageSize ?? DEFAULT_PAGE_SIZE,
    sort: initial?.sort,
    q: initial?.q,
    filters: initial?.filters ?? {},
  }
  if (!syncUrl || typeof window === 'undefined') return defaults
  return fromSearchParams(new URLSearchParams(window.location.search), defaults)
}

function writeUrl(query: TableQuery, defaults: TableQuery) {
  if (typeof window === 'undefined') return
  const current = new URLSearchParams(window.location.search)
  for (const key of Array.from(current.keys())) {
    if (['page', 'size', 'sort', 'q'].includes(key) || key.startsWith('f.')) current.delete(key)
  }
  const ours = toSearchParams(query, defaults)
  for (const [k, v] of ours.entries()) current.set(k, v)
  const search = current.toString()
  const next = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`
  if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history.replaceState(window.history.state, '', next)
  }
}

/**
 * Wraps TanStack Table with everything a data table page needs: pagination,
 * sorting, debounced search, faceted filters and selection — either computed
 * in memory (`mode: 'client'`) or delegated to a `fetcher` (`mode: 'server'`).
 */
/** @deprecated use DataTableInstance */
export type UseDataTableResult<TData> = DataTableInstance<TData>

export function useDataTable<TData>(options: DataTableOptions<TData>): DataTableInstance<TData> {
  const {
    columns,
    getRowId = defaultGetRowId,
    initialState,
    syncUrl = false,
    searchDebounceMs = 250,
    enableRowSelection = true,
  } = options

  const [initialQuery] = React.useState(() => readInitialQuery(initialState, syncUrl))
  const defaultsRef = React.useRef<TableQuery>({
    page: 1,
    pageSize: initialState?.pageSize ?? DEFAULT_PAGE_SIZE,
    sort: initialState?.sort,
    filters: {},
  })

  const [sorting, setSorting] = React.useState<SortingState>(
    initialQuery.sort ? [{ id: initialQuery.sort.id, desc: initialQuery.sort.desc }] : [],
  )
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: initialQuery.page - 1,
    pageSize: initialQuery.pageSize,
  })
  const [search, setSearchState] = React.useState(initialQuery.q ?? '')
  const debouncedSearch = useDebouncedValue(search, searchDebounceMs)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(() =>
    Object.entries(initialQuery.filters).map(([id, value]) => ({ id, value })),
  )
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() =>
    Object.fromEntries((initialState?.hiddenColumns ?? []).map((id) => [id, false])),
  )
  const [rowSelection, setRowSelectionState] = React.useState<RowSelectionState>({})
  const [allSelected, setAllSelected] = React.useState(false)

  // Any change to the result set resets the page and the selection.
  const resetKey = JSON.stringify([debouncedSearch, columnFilters])
  const lastResetKey = React.useRef(resetKey)
  React.useEffect(() => {
    if (lastResetKey.current === resetKey) return
    lastResetKey.current = resetKey
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }))
    setRowSelectionState({})
    setAllSelected(false)
  }, [resetKey])

  const query = React.useMemo<TableQuery>(() => {
    const filters: Record<string, string[]> = {}
    for (const f of columnFilters) {
      const values = Array.isArray(f.value) ? (f.value as string[]) : []
      if (values.length) filters[f.id] = values
    }
    return {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      sort: sorting[0] ? { id: sorting[0].id, desc: sorting[0].desc } : undefined,
      q: debouncedSearch || undefined,
      filters,
    }
  }, [columnFilters, pagination, sorting, debouncedSearch])

  React.useEffect(() => {
    if (syncUrl) writeUrl(query, defaultsRef.current)
  }, [query, syncUrl])

  // ---- server mode -------------------------------------------------------
  const isServer = options.mode === 'server'
  const fetcher = isServer ? options.fetcher : undefined
  const keepPreviousData = isServer ? (options.keepPreviousData ?? true) : true
  const [serverRows, setServerRows] = React.useState<TData[]>([])
  const [serverTotal, setServerTotal] = React.useState(0)
  const [hasLoaded, setHasLoaded] = React.useState(false)
  const [isFetching, setIsFetching] = React.useState(isServer)
  const [serverError, setServerError] = React.useState<Error | null>(null)
  const [refetchTick, setRefetchTick] = React.useState(0)
  const fetcherRef = React.useRef(fetcher)
  fetcherRef.current = fetcher
  const queryKey = JSON.stringify(query)

  React.useEffect(() => {
    const fetchPage = fetcherRef.current
    if (!isServer || !fetchPage) return
    const controller = new AbortController()
    setIsFetching(true)
    setServerError(null)
    if (!keepPreviousData) setHasLoaded(false)
    fetchPage(JSON.parse(queryKey) as TableQuery, controller.signal).then(
      (result) => {
        if (controller.signal.aborted) return
        setServerRows(result.rows)
        setServerTotal(result.total)
        setHasLoaded(true)
        setIsFetching(false)
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        setServerError(err instanceof Error ? err : new Error(String(err)))
        setIsFetching(false)
      },
    )
    return () => controller.abort()
  }, [isServer, keepPreviousData, queryKey, refetchTick])

  const refetch = React.useCallback(() => setRefetchTick((t) => t + 1), [])

  // ---- table ---------------------------------------------------------------
  const data = isServer ? serverRows : options.data
  const total = isServer ? serverTotal : undefined

  const setRowSelection = React.useCallback((updater: Updater<RowSelectionState>) => {
    setAllSelected(false)
    setRowSelectionState(updater)
  }, [])

  const table = useReactTable<TData>({
    data,
    columns,
    getRowId,
    state: { sorting, pagination, columnFilters, columnVisibility, rowSelection, globalFilter: debouncedSearch },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    enableRowSelection,
    filterFns: { oneOf },
    defaultColumn: { filterFn: 'oneOf' },
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    ...(isServer
      ? { manualSorting: true, manualFiltering: true, manualPagination: true, rowCount: total }
      : {
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
        }),
  })

  const filteredCount = isServer ? serverTotal : table.getFilteredRowModel().rows.length

  // ---- selection -----------------------------------------------------------
  const selection = React.useMemo<SelectionState>(() => {
    const ids = Object.keys(rowSelection).filter((id) => rowSelection[id])
    if (allSelected) return { ids: [], all: true, count: filteredCount }
    return { ids, all: false, count: ids.length }
  }, [rowSelection, allSelected, filteredCount])

  const selectPage = React.useCallback(() => {
    setAllSelected(false)
    setRowSelectionState((prev) => {
      const next = { ...prev }
      for (const row of table.getRowModel().rows) if (row.getCanSelect()) next[row.id] = true
      return next
    })
  }, [table])

  const selectAll = React.useCallback(() => {
    if (isServer) {
      setRowSelectionState({})
      setAllSelected(true)
      return
    }
    const next: RowSelectionState = {}
    for (const row of table.getFilteredRowModel().rows) if (row.getCanSelect()) next[row.id] = true
    setRowSelectionState(next)
    setAllSelected(true)
  }, [isServer, table])

  const clearSelection = React.useCallback(() => {
    setRowSelectionState({})
    setAllSelected(false)
  }, [])

  // ---- filters / search ------------------------------------------------------
  const setSearch = React.useCallback((value: string) => setSearchState(value), [])
  const setFilter = React.useCallback((columnId: string, values: string[]) => {
    setColumnFilters((prev) => {
      const rest = prev.filter((f) => f.id !== columnId)
      return values.length ? [...rest, { id: columnId, value: values }] : rest
    })
  }, [])
  const clearFilters = React.useCallback(() => setColumnFilters([]), [])

  // ---- status ------------------------------------------------------------------
  let status: DataTableStatus
  let error: Error | null
  if (isServer) {
    error = serverError
    status = serverError ? 'error' : isFetching && !hasLoaded ? 'loading' : hasLoaded ? 'success' : 'idle'
  } else {
    error = options.error ?? null
    status = error ? 'error' : options.isLoading ? 'loading' : 'success'
  }

  return {
    table,
    mode: options.mode,
    status,
    isFetching: isServer ? isFetching : Boolean(options.isLoading),
    error,
    refetch,
    query,
    total: filteredCount,
    search,
    setSearch,
    setFilter,
    clearFilters,
    selection,
    selectPage,
    selectAll,
    clearSelection,
  }
}
