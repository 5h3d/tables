import * as React from 'react'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useDataTable } from '@/hooks/use-data-table'
import { userColumns } from '../columns'
import { MockUsersApi } from '../mock-api'
import { PageIntro, Toast, useToast } from '../ui'

const api = new MockUsersApi()

function useApiState() {
  return React.useSyncExternalStore(
    api.subscribe,
    () => `${api.latency}|${api.failNext}|${api.log.length}|${api.log[0]?.at ?? 0}|${api.count}`,
  )
}

/**
 * Server mode: every sort / search / filter / page change becomes a
 * TableQuery sent to `api.list`. The table never sees more than one page.
 * The query is mirrored into the URL so the page is shareable.
 */
export function ServerPage() {
  useApiState()
  const { toast, show } = useToast()
  const instance = useDataTable({
    mode: 'server',
    columns: userColumns,
    fetcher: api.list,
    syncUrl: true,
    initialState: { sort: { id: 'name', desc: false } },
  })
  const [busy, setBusy] = React.useState(false)

  return (
    <>
      <PageIntro
        title="Server-side table"
        description="Rows come from a mock API one page at a time. Sorting, search, filters and paging are sent as a query; the table shows the previous page while the next one loads. The query is synced to the URL."
      />
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg bg-card px-4 py-3 text-[13px] shadow-card">
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Latency</span>
          <input
            type="range"
            min={0}
            max={3000}
            step={100}
            value={api.latency}
            onChange={(e) => {
              api.latency = Number(e.target.value)
              instance.refetch()
            }}
            aria-label="Latency"
          />
          <span className="w-14 tabular-nums">{api.latency} ms</span>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox checked={api.failNext} onCheckedChange={(v) => { api.failNext = v; instance.refetch() }} aria-label="Fail next request" />
          Fail next request
        </label>
        <Button variant="outline" size="sm" onClick={() => instance.refetch()}>
          Refetch
        </Button>
        <Button variant="link" size="sm" onClick={() => { api.reset(); instance.refetch() }}>
          Reset data
        </Button>
        <span className="ml-auto text-muted-foreground">
          {instance.isFetching ? 'Fetching…' : `Last request ${api.log[0] ? `${Math.round(api.log[0].ms)} ms` : '—'}`}
        </span>
      </div>
      <DataTable
        instance={instance}
        title="Users"
        entity={{ singular: 'user', plural: 'users' }}
        actions={<Button onClick={() => show('Add user clicked')}>Add user</Button>}
        errorSupport={
          <Button variant="outline" size="sm" onClick={() => show('Support contacted')}>
            Contact support
          </Button>
        }
        bulkActions={(sel, { clear }) => (
          <>
            <Button variant="outline" size="sm" onClick={() => show(`Exported ${sel.count} users`)}>
              Export
            </Button>
            <Button
              variant="destructive-outline"
              size="sm"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                try {
                  await api.remove(sel, instance.query)
                  clear()
                  instance.refetch()
                  show(`Deleted ${sel.count} users on the server`)
                } finally {
                  setBusy(false)
                }
              }}
            >
              {busy ? 'Deleting…' : 'Delete'}
            </Button>
          </>
        )}
        rowActions={(row) => [
          { label: 'View', onSelect: () => show(`View ${row.original.name}`) },
          { label: 'Edit', onSelect: () => show(`Edit ${row.original.name}`) },
          {
            label: 'Delete',
            destructive: true,
            separatorBefore: true,
            onSelect: async () => {
              await api.remove({ ids: [row.original.id], all: false }, instance.query)
              instance.refetch()
              show(`Deleted ${row.original.name} on the server`)
            },
          },
        ]}
      />
      <details className="mt-4 rounded-lg bg-card px-4 py-3 text-[13px] shadow-card">
        <summary className="cursor-pointer font-medium">Request log</summary>
        <ol className="mt-2 space-y-1 font-mono text-xs text-muted-foreground">
          {api.log.map((entry) => (
            <li key={entry.at} className={entry.ok ? '' : 'text-destructive'}>
              {entry.ok ? 'GET' : 'ERR'} /users?{new URLSearchParams(
                Object.entries({
                  page: String(entry.query.page),
                  size: String(entry.query.pageSize),
                  ...(entry.query.sort ? { sort: `${entry.query.sort.id}.${entry.query.sort.desc ? 'desc' : 'asc'}` } : {}),
                  ...(entry.query.q ? { q: entry.query.q } : {}),
                  ...Object.fromEntries(Object.entries(entry.query.filters).map(([k, v]) => [`f.${k}`, v.join(',')])),
                }),
              ).toString()}{' '}
              · {Math.round(entry.ms)} ms
            </li>
          ))}
          {api.log.length === 0 && <li>No requests yet.</li>}
        </ol>
      </details>
      <Toast toast={toast} />
    </>
  )
}
