import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { useDataTableContext } from '@/components/data-table/data-table-context'
import type { User, UserStatus } from './data'

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
export const formatDate = (iso: string) => dateFormat.format(new Date(`${iso}T00:00:00`))

const STATUS: Record<UserStatus, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  active: { label: 'Active', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  suspended: { label: 'Suspended', variant: 'destructive' },
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}

export function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-avatar text-[11px] font-semibold text-primary"
    >
      {initials(name)}
    </span>
  )
}

/**
 * Cells render as components, so they can read the table context: the avatar
 * only shows on desktop, where there is room for it (as in the design).
 */
function NameCell({ name }: { name: string }) {
  const { layout } = useDataTableContext()
  return (
    <span className="flex items-center gap-2.5 font-medium text-foreground">
      {layout === 'desktop' && <Avatar name={name} />}
      {name}
    </span>
  )
}

export function StatusBadge({ status }: { status: UserStatus }) {
  const s = STATUS[status]
  return <Badge variant={s.variant}>{s.label}</Badge>
}

/**
 * Column definitions shared by every demo page. The `meta` block is what makes
 * the same definitions work as a desktop table, a folded tablet table and a
 * mobile card list.
 */
export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableHiding: false,
    meta: { card: 'title', pinned: 'left', width: '28%' },
    cell: ({ row }) => <NameCell name={row.original.name} />,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    meta: { foldInto: 'name', card: 'subtitle' },
    cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    meta: {
      card: 'meta',
      filter: {
        options: ['Admin', 'Editor', 'Viewer', 'Billing'].map((r) => ({ label: r, value: r })),
      },
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: {
      card: 'badge',
      filter: {
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Pending', value: 'pending' },
          { label: 'Suspended', value: 'suspended' },
        ],
      },
    },
    cell: ({ getValue }) => <StatusBadge status={getValue<UserStatus>()} />,
  },
  {
    accessorKey: 'createdAt',
    header: 'Date created',
    meta: { card: 'meta', cardLabel: 'Created' },
    cell: ({ getValue }) => <span className="text-muted-foreground">{formatDate(getValue<string>())}</span>,
  },
]
