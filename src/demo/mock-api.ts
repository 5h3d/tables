import type { TableQuery } from '@/lib/data-table/query'
import { makeUsers, type User } from './data'

/**
 * A fake backend for the server-mode demo. It applies the TableQuery the way a
 * real API would (search, filters, sort, paging), waits `latency` ms and can be
 * told to fail the next request so the error state can be exercised.
 */
export class MockUsersApi {
  private rows: User[] = makeUsers()
  latency = 600
  failNext = false
  log: Array<{ at: number; query: TableQuery; ms: number; ok: boolean }> = []
  private listeners = new Set<() => void>()

  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
  private emit() {
    for (const fn of this.listeners) fn()
  }

  private wait(signal: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
      const id = setTimeout(resolve, this.latency)
      signal.addEventListener('abort', () => {
        clearTimeout(id)
        reject(new DOMException('Aborted', 'AbortError'))
      })
    })
  }

  list = async (query: TableQuery, signal: AbortSignal) => {
    const started = performance.now()
    await this.wait(signal)
    if (this.failNext) {
      this.failNext = false
      this.log.unshift({ at: Date.now(), query, ms: performance.now() - started, ok: false })
      this.emit()
      throw new Error('The request timed out. Check your connection and try again. (504)')
    }
    let rows = this.rows
    if (query.q) {
      const q = query.q.toLowerCase()
      rows = rows.filter((u) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q))
    }
    for (const [id, values] of Object.entries(query.filters)) {
      rows = rows.filter((u) => values.includes(String(u[id as keyof User])))
    }
    if (query.sort) {
      const { id, desc } = query.sort
      rows = [...rows].sort(
        (a, b) => String(a[id as keyof User]).localeCompare(String(b[id as keyof User])) * (desc ? -1 : 1),
      )
    }
    const start = (query.page - 1) * query.pageSize
    this.log.unshift({ at: Date.now(), query, ms: performance.now() - started, ok: true })
    this.log = this.log.slice(0, 8)
    this.emit()
    return { rows: rows.slice(start, start + query.pageSize), total: rows.length }
  }

  /** Delete by ids, or everything matching `query` when `all` is set. */
  remove = async (selection: { ids: string[]; all: boolean }, query: TableQuery) => {
    await new Promise((r) => setTimeout(r, this.latency / 2))
    if (selection.all) {
      const { rows } = await this.list({ ...query, page: 1, pageSize: Number.MAX_SAFE_INTEGER }, new AbortController().signal)
      const ids = new Set(rows.map((r) => r.id))
      this.rows = this.rows.filter((r) => !ids.has(r.id))
    } else {
      const ids = new Set(selection.ids)
      this.rows = this.rows.filter((r) => !ids.has(r.id))
    }
    this.emit()
  }

  reset = () => {
    this.rows = makeUsers()
    this.emit()
  }

  get count() {
    return this.rows.length
  }
}
