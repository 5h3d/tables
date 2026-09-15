import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Menu } from './menu'

const items = (onSelect: (label: string) => void) => [
  { label: 'View', onSelect: () => onSelect('View') },
  { label: 'Edit', onSelect: () => onSelect('Edit') },
  { label: 'Delete', onSelect: () => onSelect('Delete'), destructive: true, separatorBefore: true },
]

describe('Menu', () => {
  it('opens on trigger click, selects an item and closes', async () => {
    const onSelect = vi.fn()
    render(<Menu label="Row actions" items={items(onSelect)} />)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(onSelect).toHaveBeenCalledWith('Edit')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
  it('closes on Escape and supports arrow-key focus', async () => {
    render(<Menu label="Row actions" items={items(() => {})} />)
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    expect(screen.getByRole('menuitem', { name: 'View' })).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
  it('marks destructive items', async () => {
    render(<Menu label="Row actions" items={items(() => {})} />)
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute('data-destructive')
  })
})
