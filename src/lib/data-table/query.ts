export type SortSpec = { id: string; desc: boolean }

/** Everything a server needs to answer one page of a table. */
export type TableQuery = {
  /** 1-based page number */
  page: number
  pageSize: number
  sort?: SortSpec
  /** global search string */
  q?: string
  /** column id -> selected values */
  filters: Record<string, string[]>
}

const FILTER_PREFIX = 'f.'

/**
 * Serialise a query into URL search params. Values equal to `defaults`
 * are omitted so the URL stays clean.
 */
export function toSearchParams(query: TableQuery, defaults?: Partial<TableQuery>): URLSearchParams {
  const sp = new URLSearchParams()
  if (query.page !== (defaults?.page ?? 0)) sp.set('page', String(query.page))
  if (query.pageSize !== (defaults?.pageSize ?? 0)) sp.set('size', String(query.pageSize))
  const sortDiffers =
    query.sort && (query.sort.id !== defaults?.sort?.id || query.sort.desc !== defaults?.sort?.desc)
  if (query.sort && sortDiffers) sp.set('sort', `${query.sort.id}.${query.sort.desc ? 'desc' : 'asc'}`)
  if (query.q) sp.set('q', query.q)
  for (const [id, values] of Object.entries(query.filters)) {
    if (values.length) sp.set(FILTER_PREFIX + id, values.join(','))
  }
  return sp
}

const toInt = (value: string | null, fallback: number) => {
  if (value === null) return fallback
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

/** Parse URL search params back into a query, falling back to `defaults`. */
export function fromSearchParams(sp: URLSearchParams, defaults: TableQuery): TableQuery {
  const query: TableQuery = {
    page: Math.max(1, toInt(sp.get('page'), defaults.page)),
    pageSize: Math.max(1, toInt(sp.get('size'), defaults.pageSize)),
    filters: { ...defaults.filters },
  }
  const sort = sp.get('sort')
  if (sort) {
    const dot = sort.lastIndexOf('.')
    const dir = dot >= 0 ? sort.slice(dot + 1) : ''
    if (dot > 0 && (dir === 'asc' || dir === 'desc')) {
      query.sort = { id: sort.slice(0, dot), desc: dir === 'desc' }
    }
  } else if (defaults.sort) {
    query.sort = defaults.sort
  }
  const q = sp.get('q')
  if (q) query.q = q
  for (const [key, value] of sp.entries()) {
    if (!key.startsWith(FILTER_PREFIX)) continue
    const id = key.slice(FILTER_PREFIX.length)
    if (!id) continue
    const values = value.split(',').filter(Boolean)
    if (values.length) query.filters[id] = values
  }
  return query
}
