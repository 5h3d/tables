import * as React from 'react'
import { cn } from '../../lib/utils'
import { Button, type ButtonProps } from './button'
import { Popover } from './popover'

export type MenuItem = {
  label: React.ReactNode
  onSelect: () => void
  destructive?: boolean
  disabled?: boolean
  separatorBefore?: boolean
}

export type MenuProps = {
  /** Accessible name of the trigger button */
  label: string
  items: MenuItem[]
  /** Custom trigger content; defaults to a kebab icon */
  children?: React.ReactNode
  align?: 'start' | 'end'
  triggerProps?: Omit<ButtonProps, 'onClick' | 'children'>
  className?: string
}

export const KebabIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden className="size-4">
    <circle cx="8" cy="3" r="1.4" fill="currentColor" />
    <circle cx="8" cy="8" r="1.4" fill="currentColor" />
    <circle cx="8" cy="13" r="1.4" fill="currentColor" />
  </svg>
)

/**
 * Action menu on native elements: a <button> trigger and a popover panel with
 * role="menu". Keyboard: arrows, Home/End, Enter/Space, Escape, Tab closes.
 */
export function Menu({ label, items, children, align = 'end', triggerProps, className }: MenuProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const els = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])'),
    )
    const i = els.indexOf(document.activeElement as HTMLElement)
    const focusAt = (n: number) => els[(n + els.length) % els.length]?.focus()
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        focusAt(i + 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        focusAt(i - 1)
        break
      case 'Home':
        e.preventDefault()
        focusAt(0)
        break
      case 'End':
        e.preventDefault()
        focusAt(els.length - 1)
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        {...triggerProps}
        className={cn(
          'text-faint hover:text-foreground data-[state=open]:bg-secondary data-[state=open]:text-foreground',
          triggerProps?.className,
          className,
        )}
        data-state={open ? 'open' : 'closed'}
      >
        {children ?? <KebabIcon />}
      </Button>
      <Popover
        open={open}
        onOpenChange={setOpen}
        anchorRef={triggerRef}
        align={align}
        role="menu"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="min-w-36"
      >
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            {item.separatorBefore && idx > 0 && <div role="separator" className="my-1 h-px bg-border" />}
            <button
              type="button"
              role="menuitem"
              tabIndex={-1}
              aria-disabled={item.disabled || undefined}
              data-destructive={item.destructive || undefined}
              onClick={() => {
                if (item.disabled) return
                setOpen(false)
                item.onSelect()
              }}
              className={cn(
                'flex w-full cursor-pointer items-center rounded-md px-2.5 py-1.5 text-left outline-none hover:bg-secondary focus:bg-secondary',
                item.destructive && 'text-destructive',
                item.disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </Popover>
    </>
  )
}
