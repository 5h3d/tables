import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from './data-table'
import { useDataTable } from '@/hooks/use-data-table'
import { users, type User } from '@/demo/data'

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name', meta: { card: 'title' } },
  { accessorKey: 'email', header: 'Email', meta: { foldInto: 'name', card: 'subtitle' } },
  { accessorKey: 'role', header: 'Role', meta: { card: 'meta' } },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { card: 'badge', filter: { options: [{ label: 'Active', value: 'active' }, { label: 'Suspended', value: 'suspended' }] } },
  },
  { accessorKey: 'createdAt', header: 'Date created', meta: { card: 'meta', cardLabel: 'Created' } },
]

type HarnessProps = Partial<React.ComponentProps<typeof DataTable<User>>> & { data?: User[]; isLoading?: boolean; error?: Error }
function Harness({ data = users, isLoading, error, ...props }: HarnessProps) {
  const instance = useDataTable({ mode: 'client', data, columns, isLoading, error, searchDebounceMs: 0 })
  return <DataTable instance={instance} title="Users" entity={{ singular: 'user', plural: 'users' }} layout="desktop" {...props} />
}

describe('DataTable · desktop grid', () => {
  it('renders the toolbar, header labels and the first page of rows', () => {
    render(<Harness />)
    expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument()
    expect(screen.getByText('78 total')).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(within(table).getByRole('columnheader', { name: /Name/ })).toBeInTheDocument()
    expect(within(table).getByRole('columnheader', { name: /Email/ })).toBeInTheDocument()
    expect(within(table).getAllByRole('row')).toHaveLength(11) // header + 10
    expect(within(table).getByText('Amara Okafor')).toBeInTheDocument()
  })

  it('sorts when a header is clicked and reports aria-sort', async () => {
    render(<Harness />)
    const header = screen.getByRole('columnheader', { name: /Name/ })
    expect(header).toHaveAttribute('aria-sort', 'none')
    await userEvent.click(within(header).getByRole('button'))
    expect(header).toHaveAttribute('aria-sort', 'ascending')
    await userEvent.click(within(header).getByRole('button'))
    expect(header).toHaveAttribute('aria-sort', 'descending')
  })

  it('filters rows through the search box', async () => {
    render(<Harness search={{ placeholder: 'Search users' }} />)
    await userEvent.type(screen.getByPlaceholderText('Search users'), 'okafor')
    expect(screen.getAllByRole('row')).toHaveLength(2)
    expect(screen.getByText('1 result')).toBeInTheDocument()
  })

  it('renders row actions and calls the handler', async () => {
    const onEdit = vi.fn()
    render(<Harness rowActions={(row) => [{ label: 'Edit', onSelect: () => onEdit(row.original.name) }]} />)
    const firstRow = screen.getAllByRole('row')[1]
    await userEvent.click(within(firstRow).getByRole('button', { name: /actions/i }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalledWith('Amara Okafor')
  })

  it('applies faceted filters from the Filter popover', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Filter' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Suspended' }))
    const suspended = users.filter((u) => u.status === 'suspended').length
    expect(screen.getByText(`${suspended} results`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filter 1' })).toBeInTheDocument()
  })
})

describe('DataTable · selection and bulk bar', () => {
  it('shows an indeterminate header checkbox and a bulk bar with the count', async () => {
    const onDelete = vi.fn()
    render(
      <Harness
        bulkActions={(sel) => (
          <button type="button" onClick={() => onDelete(sel)}>
            Delete
          </button>
        )}
      />,
    )
    const rows = screen.getAllByRole('row')
    await userEvent.click(within(rows[1]).getByRole('checkbox'))
    await userEvent.click(within(rows[2]).getByRole('checkbox'))
    const header = within(rows[0]).getByRole('checkbox') as HTMLInputElement
    expect(header.indeterminate).toBe(true)
    const bar = screen.getByRole('region', { name: 'Bulk actions' })
    expect(bar).toHaveTextContent('2 selected')
    await userEvent.click(within(bar).getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith({ ids: ['u_001', 'u_002'], all: false, count: 2 })
    await userEvent.click(within(bar).getByRole('button', { name: 'Clear selection' }))
    expect(screen.queryByRole('region', { name: 'Bulk actions' })).not.toBeInTheDocument()
  })

  it('offers select page / select all / clear from the header caret', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Selection options' }))
    expect(screen.getByRole('menuitem', { name: 'Select page (10)' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Select all 78' }))
    expect(screen.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('78 selected')
  })
})

describe('DataTable · pagination', () => {
  it('renders the range, numbered pages and disables Previous on page 1', async () => {
    render(<Harness />)
    expect(screen.getByText('Showing 1–10 of 78')).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 8')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Page 8' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Page 5' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(screen.getByText('Showing 11–20 of 78')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
  })

  it('changes the page size', async () => {
    render(<Harness />)
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '20')
    expect(screen.getByText('Showing 1–20 of 78')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(21)
  })

  it('uses the stacked mobile footer', () => {
    render(<Harness layout="mobile" />)
    expect(screen.getByText('Page 1 of 8')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '10 / page' })).toBeInTheDocument()
    expect(screen.queryByText('Rows per page')).not.toBeInTheDocument()
  })
})

describe('DataTable · responsive layouts', () => {
  it('folds the email under the name on tablet', () => {
    render(<Harness layout="tablet" />)
    expect(screen.queryByRole('columnheader', { name: /Email/ })).not.toBeInTheDocument()
    const nameCell = screen.getByText('Amara Okafor').closest('td')!
    expect(within(nameCell).getByText('amara.okafor@northwind.io')).toBeInTheDocument()
  })

  it('renders cards on mobile with title, badge, subtitle and meta', async () => {
    render(<Harness layout="mobile" mobile="cards" />)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    const list = screen.getByRole('list')
    const first = within(list).getAllByRole('listitem')[0]
    expect(within(first).getByText('Amara Okafor')).toBeInTheDocument()
    expect(within(first).getByText('amara.okafor@northwind.io')).toBeInTheDocument()
    expect(first).toHaveTextContent('Admin · Created 2026-03-04')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Sort' }), 'name.desc')
    expect(within(screen.getByRole('list')).getAllByRole('listitem')[0]).not.toHaveTextContent('Amara Okafor')
    await userEvent.click(screen.getByRole('checkbox', { name: /Select all users on this page/ }))
    expect(screen.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('10 selected')
  })

  it('renders a scrollable table with sticky checkbox and pinned column on mobile', () => {
    const pinned = columns.map((c) => ('accessorKey' in c && c.accessorKey === 'name' ? { ...c, meta: { ...c.meta, pinned: 'left' as const } } : c))
    function Pinned() {
      const instance = useDataTable({ mode: 'client', data: users, columns: pinned })
      return <DataTable instance={instance} layout="mobile" mobile="scroll" />
    }
    render(<Pinned />)
    const table = screen.getByRole('table')
    expect(screen.getByRole('columnheader', { name: /Email/ })).toBeInTheDocument()
    const nameHeader = screen.getByRole('columnheader', { name: /Name/ })
    expect(nameHeader.className).toContain('sticky')
    const headerCheckbox = within(table).getAllByRole('row')[0].querySelector('th')!
    expect(headerCheckbox.className).toContain('sticky')
  })
})

describe('DataTable · states', () => {
  it('renders skeleton rows while loading', () => {
    render(<Harness data={[]} isLoading />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(10)
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument()
  })

  it('renders the empty state with a clear-search action', async () => {
    render(<Harness />)
    await userEvent.type(screen.getByRole('searchbox'), 'quantum')
    expect(screen.getByText('0 results')).toBeInTheDocument()
    expect(screen.getByText(/No users match “quantum”/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(screen.getByText('78 total')).toBeInTheDocument()
  })

  it('renders the error state with a retry action', () => {
    render(<Harness data={[]} error={new Error('The request timed out.')} errorSupport={<a href="#support">Contact support</a>} />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent("Couldn’t load users")
    expect(alert).toHaveTextContent('The request timed out.')
    expect(within(alert).getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    expect(within(alert).getByRole('link', { name: 'Contact support' })).toBeInTheDocument()
  })

  it('applies density and zebra', () => {
    const { container } = render(<Harness density="compact" zebra />)
    const root = container.querySelector('[data-slot="data-table"]') as HTMLElement
    expect(root.style.getPropertyValue('--dt-row-py')).toBe('8px')
    expect(root).toHaveAttribute('data-density', 'compact')
    expect(screen.getAllByRole('row')[2].className).toContain('even:bg-zebra')
  })
})

describe('DataTable · follow-ups', () => {
  it('offers select page / select all from the mobile controls', async () => {
    render(<Harness layout="mobile" mobile="cards" />)
    await userEvent.click(screen.getByRole('button', { name: 'Selection options' }))
    expect(screen.getByRole('menuitem', { name: 'Select page (10)' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Select all 78' }))
    expect(screen.getByRole('region', { name: 'Bulk actions' })).toHaveTextContent('78 selected')
  })

  it('offers the selection menu on tablet too', async () => {
    render(<Harness layout="tablet" />)
    expect(screen.getByRole('button', { name: 'Selection options' })).toBeInTheDocument()
  })

  it('lets the user hide and show columns', async () => {
    render(<Harness />)
    expect(screen.getByRole('columnheader', { name: /Role/ })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Columns' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Role' }))
    expect(screen.queryByRole('columnheader', { name: /Role/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Columns 1' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Show all columns' }))
    expect(screen.getByRole('columnheader', { name: /Role/ })).toBeInTheDocument()
  })

  it('excludes hidden columns from mobile cards', async () => {
    render(<Harness layout="mobile" mobile="cards" />)
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Admin')
    await userEvent.click(screen.getByRole('button', { name: 'Columns' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Role' }))
    expect(screen.getAllByRole('listitem')[0]).not.toHaveTextContent('Admin')
  })

  it('shows numbered pages on mobile', async () => {
    render(<Harness layout="mobile" />)
    expect(screen.getByRole('button', { name: 'Page 8' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Page 4' }))
    expect(screen.getByText('Page 4 of 8')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Page 2' })).not.toBeInTheDocument()
  })
})
