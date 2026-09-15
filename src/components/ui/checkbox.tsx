import * as React from 'react'
import { cn } from '../../lib/utils'

export type CheckedState = boolean | 'indeterminate'

export type CheckboxProps = Omit<React.ComponentProps<'input'>, 'checked' | 'onChange' | 'type'> & {
  checked: CheckedState
  onCheckedChange: (checked: boolean) => void
}

/**
 * Native checkbox styled to the design (16px, 1.5px border, indigo when set).
 * Controlled: pass `checked` (or 'indeterminate') and handle `onCheckedChange`.
 */
export function Checkbox({ checked, onCheckedChange, className, ...props }: CheckboxProps) {
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = checked === 'indeterminate'
  }, [checked])
  return (
    <input
      ref={ref}
      type="checkbox"
      data-slot="checkbox"
      checked={checked === true}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className={cn(
        'peer size-4 shrink-0 cursor-pointer appearance-none rounded-[4px] border-[1.5px] border-input bg-background outline-none transition-colors',
        'focus-visible:ring-[3px] focus-visible:ring-ring/25',
        // checked / indeterminate fills live in index.css ([data-slot="checkbox"])
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
