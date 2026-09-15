import * as React from 'react'
import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { useDataTable } from '@/hooks/use-data-table'
import { users as initialUsers, type User } from '../data'
import { userColumns } from '../columns'
import { PageIntro, Toast, useToast } from '../ui'

/**
 * Client mode: the whole dataset is in memory and TanStack Table does the
 * sorting, filtering and paging. Row / bulk actions mutate local state.
 */
export function ClientPage() {
  const [users, setUsers] = React.useState<User[]>(initialUsers)
  const { toast, show } = useToast()
  const instance = useDataTable({
    mode: 'client',
    data: users,
    columns: userColumns,
    initialState: { sort: { id: 'name', desc: false } },
  })

  return (
    <>
      <PageIntro
        title="Client-side table"
        description="78 users held in memory. Sorting, search, faceted filters, selection and pagination all run in the browser. Resize the window to see the tablet and mobile layouts."
      />
      <DataTable
        instance={instance}
        title="Users"
        entity={{ singular: 'user', plural: 'users' }}
        actions={<Button onClick={() => show('Add user clicked')}>Add user</Button>}
        bulkActions={(sel, { clear }) => (
          <>
            <Button variant="outline" size="sm" onClick={() => show(`Exported ${sel.count} users`)}>
              Export
            </Button>
            <Button
              variant="destructive-outline"
              size="sm"
              onClick={() => {
                setUsers((prev) => (sel.all ? [] : prev.filter((u) => !sel.ids.includes(u.id))))
                clear()
                show(`Deleted ${sel.count} users`)
              }}
            >
              Delete
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
            onSelect: () => {
              setUsers((prev) => prev.filter((u) => u.id !== row.original.id))
              show(`Deleted ${row.original.name}`)
            },
          },
        ]}
      />
      {users.length < initialUsers.length && (
        <div className="mt-3 text-[13px] text-muted-foreground">
          {initialUsers.length - users.length} deleted locally.{' '}
          <button type="button" className="cursor-pointer font-medium text-primary hover:underline" onClick={() => setUsers(initialUsers)}>
            Reset data
          </button>
        </div>
      )}
      <Toast toast={toast} />
    </>
  )
}
