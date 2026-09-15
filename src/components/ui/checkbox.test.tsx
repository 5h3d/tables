import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('reflects checked and indeterminate state on the native input', () => {
    const { rerender } = render(<Checkbox checked aria-label="row" onCheckedChange={() => {}} />)
    const input = screen.getByRole('checkbox', { name: 'row' }) as HTMLInputElement
    expect(input.checked).toBe(true)
    expect(input.indeterminate).toBe(false)
    rerender(<Checkbox checked="indeterminate" aria-label="row" onCheckedChange={() => {}} />)
    expect(input.indeterminate).toBe(true)
    expect(input.checked).toBe(false)
  })
  it('calls onCheckedChange with the next value', async () => {
    const onChange = vi.fn()
    render(<Checkbox checked={false} aria-label="row" onCheckedChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
