# Tables

A shadcn-style, **mobile-responsive** data table for React. One set of column
definitions renders as a full table on desktop, a folded table on tablet, and
either a card list or a pinned-column scroll view on phones. Works with data in
memory (**client mode**) or one page at a time from an API (**server mode**).

**Demo:** https://5h3d.github.io/tables

- Sorting, debounced global search, faceted filters, numbered pagination
- Row selection with an indeterminate header checkbox, "select page / select all N" on every layout, and a bulk-action bar
- Show / hide columns from a "Columns" control (opt columns out with `enableHiding: false`)
- Row action menus, toolbar action slot, empty / loading (skeleton) / error states
- Density (compact / comfortable / spacious) and zebra striping
- Server mode: abortable fetches, keep-previous-data, retry, optional URL sync
- Native elements only (no Radix); styled with Tailwind v4 and shadcn CSS variables
- Built on [TanStack Table v8](https://tanstack.com/table)

## Install

Like any shadcn block, the source is copied into your project so you own it:

```bash
npx shadcn@latest add https://5h3d.github.io/tables/r/data-table.json
```

This adds `components/data-table/*`, the native `components/ui/*` primitives it
uses, `hooks/use-data-table.ts` and `lib/data-table/*`, installs
`@tanstack/react-table`, and appends the extra colour tokens to your CSS.
Your project needs Tailwind v4 with a shadcn theme (`--primary`, `--muted`,
`--border`, …) and the `@/` alias.

## Usage

```tsx
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table'
import { useDataTable } from '@/hooks/use-data-table'

type User = { id: string; name: string; email: string; role: string; status: string; createdAt: string }

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name', meta: { card: 'title', pinned: 'left' } },
  { accessorKey: 'email', header: 'Email', meta: { foldInto: 'name', card: 'subtitle' } },
  { accessorKey: 'role', header: 'Role', meta: { card: 'meta' } },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { card: 'badge', filter: { options: [{ label: 'Active', value: 'active' }] } },
  },
  { accessorKey: 'createdAt', header: 'Date created', meta: { card: 'meta', cardLabel: 'Created' } },
]

export function UsersTable({ users }: { users: User[] }) {
  const instance = useDataTable({ mode: 'client', data: users, columns })
  return (
    <DataTable
      instance={instance}
      title="Users"
      entity={{ singular: 'user', plural: 'users' }}
      actions={<button>Add user</button>}
      bulkActions={(selection, { clear }) => <button onClick={clear}>Export {selection.count}</button>}
      rowActions={(row) => [
        { label: 'Edit', onSelect: () => edit(row.original) },
        { label: 'Delete', destructive: true, separatorBefore: true, onSelect: () => remove(row.original) },
      ]}
    />
  )
}
```

### Server mode

Give the hook a `fetcher` instead of `data`. Every sort / search / filter /
page change becomes a `TableQuery`; the hook aborts stale requests, keeps the
previous page visible while the next loads, and exposes `refetch` for the
error state's Retry button.

```tsx
const instance = useDataTable({
  mode: 'server',
  columns,
  syncUrl: true, // mirror page/size/sort/q/filters into location.search
  fetcher: async (query, signal) => {
    const res = await fetch(`/api/users?${toSearchParams(query)}`, { signal })
    const json = await res.json()
    return { rows: json.items, total: json.total }
  },
})
```

`TableQuery` is `{ page, pageSize, sort?: { id, desc }, q?, filters: Record<string, string[]> }`.
`toSearchParams` / `fromSearchParams` in `lib/data-table/query.ts` encode it as
`?page=2&size=20&sort=name.desc&q=ann&f.status=active,pending`.

### Column `meta`

| key         | effect                                                                                 |
| ----------- | -------------------------------------------------------------------------------------- |
| `foldInto`  | tablet: render inside the target column's cell as a second line (e.g. email under name) |
| `hideOn`    | `['tablet' \| 'mobile']` hide the column on those layouts                               |
| `card`      | mobile cards: `'title' \| 'subtitle' \| 'badge' \| 'meta' \| 'body' \| 'hidden'`         |
| `cardLabel` | prefix for `meta` values in cards ("Created Mar 4, 2026")                               |
| `pinned`    | `'left'` keeps the column sticky in the mobile scroll layout                            |
| `filter`    | `{ options }` adds the column to the Filter popover and to `query.filters`             |
| `align`     | `'left' \| 'center' \| 'right'`                                                          |
| `width`     | CSS width for the header cell                                                           |
| `label`     | plain-text label used by the mobile sort select                                         |

### `<DataTable>` props

| prop                        | notes                                                                      |
| --------------------------- | -------------------------------------------------------------------------- |
| `instance`                  | result of `useDataTable`                                                   |
| `title`, `description`      | toolbar heading                                                            |
| `entity`                    | `{ singular, plural }` used in counts and state copy                        |
| `search`                    | `{ placeholder }` or `false`                                               |
| `filter`                    | show the built-in faceted Filter button (auto when any column has `meta.filter`) |
| `columns`                   | show the Columns (show / hide) button, default `true`                      |
| `actions`                   | toolbar slot (e.g. Add button)                                             |
| `bulkActions(selection, { clear })` | content of the bulk bar next to "N selected"                       |
| `rowActions(row)`           | `MenuItem[]` for the kebab menu                                            |
| `layout`                    | `'auto'` (measure the container) or force `'desktop' \| 'tablet' \| 'mobile'` |
| `mobile`                    | `'cards'` (default) or `'scroll'`                                          |
| `density`, `zebra`          | row padding and striping                                                   |
| `card(row)`                 | custom card body for mobile cards                                          |
| `emptyState`, `errorState`, `errorSupport` | override the built-in states                              |
| `pageSizeOptions`           | default `[10, 20, 50]`                                                     |

Breakpoints are based on the **container** width, not the viewport:
desktop ≥ 1024px, tablet 640–1023px, mobile < 640px.

### `useDataTable` result

`initialState.hiddenColumns` hides columns until the user shows them.

`table` (TanStack instance), `status` (`idle | loading | success | error`),
`isFetching`, `error`, `refetch()`, `query`, `total`, `search` / `setSearch`,
`setFilter(columnId, values)` / `clearFilters()`, `selection`
(`{ ids, all, count }`), `selectPage()`, `selectAll()`, `clearSelection()`.

## Development

```bash
pnpm install
pnpm dev            # demo at http://localhost:5173
pnpm test           # vitest
pnpm typecheck && pnpm lint
pnpm registry:build # writes public/r/*.json for `shadcn add`
```

`src/demo/mock-api.ts` shows what a server needs to implement for server mode:
it applies a `TableQuery` to a list and returns `{ rows, total }`.

## License

MIT
