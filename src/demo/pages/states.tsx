import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { useDataTable } from '@/hooks/use-data-table'
import { users } from '../data'
import { userColumns } from '../columns'
import { PageIntro } from '../ui'

function EmptyDemo() {
  const instance = useDataTable({ mode: 'client', data: users, columns: userColumns, initialState: { q: 'quantum' } })
  return <DataTable instance={instance} title="Users" entity={{ singular: 'user', plural: 'users' }} />
}

function LoadingDemo() {
  const instance = useDataTable({ mode: 'client', data: [], columns: userColumns, isLoading: true })
  return <DataTable instance={instance} title="Users" entity={{ singular: 'user', plural: 'users' }} />
}

function ErrorDemo() {
  const instance = useDataTable({
    mode: 'client',
    data: [],
    columns: userColumns,
    error: new Error('The request timed out. Check your connection and try again.'),
  })
  return (
    <DataTable
      instance={instance}
      title="Users"
      entity={{ singular: 'user', plural: 'users' }}
      errorSupport={
        <Button variant="outline" size="sm">
          Contact support
        </Button>
      }
    />
  )
}

export function StatesPage() {
  return (
    <>
      <PageIntro title="Table states" description="Empty (no results for a search), loading (skeleton rows) and error (with retry)." />
      <div className="grid gap-6 lg:grid-cols-1">
        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Empty</h3>
          <EmptyDemo />
        </section>
        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Loading</h3>
          <LoadingDemo />
        </section>
        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Error</h3>
          <ErrorDemo />
        </section>
      </div>
    </>
  )
}
