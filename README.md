# Tables

> I hate when tables are not responsive.

Every table library I reach for looks great on a laptop and falls apart on a
phone. You get a horizontal scrollbar swallowing half the columns, a header row
that drifts away from its data, or a "mobile mode" that quietly drops the
columns you actually needed.

So this is a React data table where the small screen is part of the design, not
an afterthought. You write your columns once. On a wide screen you get a normal
table. On a tablet, secondary columns fold underneath their neighbours. On a
phone, each row becomes a readable card, or a horizontally scrolling table with
the first column pinned, whichever suits your data.

It handles the boring parts too: sorting, search, filters, selection, bulk
actions, row menus, pagination, and the empty, loading and error states. Your
data can live in memory or come from an API one page at a time.

**[Try the demo](https://5h3d.github.io/tables)** — resize the window, or open
the playground and drag the width slider.

## Install

```bash
npm install 5h3d/tables @tanstack/react-table
```

`react`, `react-dom` and `@tanstack/react-table` v8 are peer dependencies.

## Quick start

```tsx
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable, useDataTable } from '@5h3d/tables'
import '@5h3d/tables/styles.css'

type User = { id: string; name: string; email: string; role: string; status: string; createdAt: string }

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name', meta: { card: 'title', pinned: 'left' } },
  { accessorKey: 'email', header: 'Email', meta: { foldInto: 'name', card: 'subtitle' } },
  { accessorKey: 'role', header: 'Role', meta: { card: 'meta' } },
  { accessorKey: 'status', header: 'Status', meta: { card: 'badge' } },
  { accessorKey: 'createdAt', header: 'Date created', meta: { card: 'meta', cardLabel: 'Created' } },
]

export function UsersTable({ users }: { users: User[] }) {
  const instance = useDataTable({ mode: 'client', data: users, columns })

  return (
    <DataTable
      instance={instance}
      title="Users"
      entity={{ singular: 'user', plural: 'users' }}
      rowActions={(row) => [
        { label: 'Edit', onSelect: () => edit(row.original) },
        { label: 'Delete', destructive: true, separatorBefore: true, onSelect: () => remove(row.original) },
      ]}
    />
  )
}
```

That is the whole setup. The hook owns the state, the component renders it, and
the layout follows the width of whatever container you drop it into.

## What responsive actually means here

The table measures **its own container**, not the viewport, so it behaves the
same inside a narrow sidebar as it does on a small phone.

| Container width | What you get |
| --- | --- |
| 1024px and up | The full table. Every column, a numbered pager, row menus. |
| 640–1023px | Columns marked `foldInto` move under their target column as a second line, so the table stops overflowing. |
| Below 640px | Rows become cards built from your column roles. Or set `mobile="scroll"` for a scrolling table with the checkbox and first column pinned. |

Nothing is hidden behind a media query you cannot reach: pass `layout` to force
a specific rendering, which is handy for tests and for stories.

## Server-side data

Swap `data` for a `fetcher` and every change becomes one request. The hook
cancels requests that are no longer relevant, keeps the current page on screen
while the next one loads, and hands you `refetch` for the Retry button.

```tsx
import { useDataTable, toSearchParams } from '@5h3d/tables'

const instance = useDataTable({
  mode: 'server',
  columns,
  syncUrl: true, // keeps page, size, sort, search and filters in the address bar
  fetcher: async (query, signal) => {
    const res = await fetch(`/api/users?${toSearchParams(query)}`, { signal })
    if (!res.ok) throw new Error('Could not load users')
    const json = await res.json()
    return { rows: json.items, total: json.total }
  },
})
```

A query looks like this:

```ts
type TableQuery = {
  page: number // 1-based
  pageSize: number
  sort?: { id: string; desc: boolean }
  q?: string // debounced search box
  filters: Record<string, string[]> // column id -> selected values
}
```

`toSearchParams` and `fromSearchParams` encode it as
`?page=2&size=20&sort=name.desc&q=ann&f.status=active,pending`, so your backend
has an obvious contract to implement. `src/demo/mock-api.ts` is a working
example of the server side.

Selection works across pages: when someone picks "Select all 78", you receive
`{ ids: [], all: true, count: 78 }` and can turn that into a single bulk request
instead of 78 ids.

## Column meta

`meta` is where a column says how it should behave when space runs out.

| Key | What it does |
| --- | --- |
| `foldInto` | On tablet, render this value inside the named column's cell (email under name). |
| `card` | On phones: `'title'`, `'subtitle'`, `'badge'`, `'meta'`, `'body'` or `'hidden'`. |
| `cardLabel` | Prefix for a `meta` value in a card, giving "Created Mar 4, 2026". |
| `pinned` | `'left'` keeps the column visible in the scrolling mobile layout. |
| `hideOn` | Drop the column entirely on `'tablet'`, `'mobile'` or both. |
| `filter` | `{ options }` puts the column in the Filter popover and in `query.filters`. |
| `align`, `width`, `label` | Cell alignment, header width, and the plain-text name used by the mobile sort control. |

Columns can opt out of being hidden by hand with `enableHiding: false`, which is
what you want for the column that identifies the row.

## DataTable props

| Prop | Notes |
| --- | --- |
| `instance` | What `useDataTable` returned. |
| `title`, `description` | Toolbar heading. |
| `entity` | `{ singular, plural }`, used in counts and in state messages. |
| `search` | `{ placeholder }`, or `false` to remove the search box. |
| `filter`, `columns` | Show the Filter and Columns controls. Both default to on. |
| `actions` | Your own buttons on the right of the toolbar. |
| `bulkActions` | `(selection, { clear }) => ReactNode` for the bar that appears when rows are selected. |
| `rowActions` | `(row) => MenuItem[]` for the row menu. |
| `layout` | `'auto'` by default; force `'desktop'`, `'tablet'` or `'mobile'`. |
| `mobile` | `'cards'` (default) or `'scroll'`. |
| `density`, `zebra` | `'compact' \| 'comfortable' \| 'spacious'`, and striped rows. |
| `card` | `(row) => ReactNode` if you want to lay the mobile card out yourself. |
| `emptyState`, `errorState`, `errorSupport` | Replace or extend the built-in states. |
| `pageSizeOptions`, `pagination` | Page size choices, and a switch to hide the footer. |

## useDataTable

```ts
const {
  table,          // the underlying TanStack table, if you need it
  status,         // 'idle' | 'loading' | 'success' | 'error'
  isFetching,     // a request is in flight, previous rows still shown
  error, refetch,
  query, total,
  search, setSearch,
  setFilter, clearFilters,
  selection,      // { ids, all, count }
  selectPage, selectAll, clearSelection,
} = useDataTable(options)
```

Options common to both modes: `columns`, `getRowId`, `enableRowSelection`,
`searchDebounceMs`, `syncUrl`, and `initialState` for the starting `page`,
`pageSize`, `sort`, `q`, `filters` and `hiddenColumns`.

## Styling

The stylesheet ships with the design tokens plus only the utility classes the
components use. There is no global reset in it, so importing it will not
restyle the rest of your app.

Restyle the table by overriding the variables it reads:

```css
:root {
  --primary: #0f766e;
  --radius: 0.75rem;
  --border: #d9e2e0;
}
```

Already using Tailwind? Skip the stylesheet and add the package source to your
content sources instead, so the utilities come out of your own build:

```css
@source "../node_modules/@5h3d/tables/src";
```

## Prefer to own the code?

Everything lives in readable files with no hidden dependencies, so copying is a
first-class option: take `src/components/data-table`, `src/components/ui`,
`src/hooks` and `src/lib` into your project and edit away. The imports between
those files are relative, so nothing needs a path alias to work.

## Development

```bash
pnpm install
pnpm dev        # demo on http://localhost:5173
pnpm test       # vitest
pnpm typecheck && pnpm lint
pnpm build:lib  # the package build
```

Issues and pull requests are welcome, especially ones about layouts that still
feel wrong on a phone.

## License

MIT
