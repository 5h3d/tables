import * as React from 'react'
import { cn } from '../../lib/utils'

export type PopoverProps = React.ComponentProps<'div'> & {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Element the panel is anchored to (usually the trigger button). */
  anchorRef: React.RefObject<HTMLElement | null>
  align?: 'start' | 'end'
  /** Move focus to the first focusable element (or the panel) when opened. Default true. */
  autoFocus?: boolean
}

/**
 * Native-popover panel: rendered in the top layer with `popover="manual"` and
 * positioned with fixed coordinates next to `anchorRef`, so it escapes any
 * overflow/scroll container. Closes on Escape, outside pointer-down, scroll
 * and resize. Menus, filter panels and the select-all dropdown build on this.
 */
export function Popover({
  open,
  onOpenChange,
  anchorRef,
  align = 'end',
  autoFocus = true,
  className,
  style,
  children,
  onKeyDown,
  ...props
}: PopoverProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const [pos, setPos] = React.useState<{ top: number; left?: number; right?: number }>({ top: 0 })

  React.useLayoutEffect(() => {
    if (!open) return
    const anchor = anchorRef.current
    const panel = panelRef.current
    if (!anchor || !panel) return
    const rect = anchor.getBoundingClientRect()
    const next: typeof pos = { top: rect.bottom + 4 }
    if (align === 'end') next.right = Math.max(8, window.innerWidth - rect.right)
    else next.left = Math.max(8, rect.left)
    try {
      panel.showPopover()
    } catch {
      /* already shown or unsupported */
    }
    const overflow = rect.bottom + 4 + panel.offsetHeight - window.innerHeight
    if (overflow > 0) next.top = Math.max(8, rect.top - 4 - panel.offsetHeight)
    setPos(next)
    if (autoFocus) {
      const first = panel.querySelector<HTMLElement>(
        '[role="menuitem"]:not([aria-disabled="true"]), input:not([disabled]), button:not([disabled])',
      )
      ;(first ?? panel).focus()
    }
  }, [open, align, anchorRef, autoFocus])

  React.useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (panelRef.current?.contains(t) || anchorRef.current?.contains(t)) return
      onOpenChange(false)
    }
    const onDismiss = () => onOpenChange(false)
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('scroll', onDismiss, true)
    window.addEventListener('resize', onDismiss)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('scroll', onDismiss, true)
      window.removeEventListener('resize', onDismiss)
    }
  }, [open, onOpenChange, anchorRef])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      popover="manual"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          onOpenChange(false)
          anchorRef.current?.focus()
          return
        }
        onKeyDown?.(e)
      }}
      style={{
        position: 'fixed',
        top: pos.top,
        bottom: 'auto',
        left: pos.left ?? 'auto',
        right: pos.right ?? 'auto',
        margin: 0,
        ...style,
      }}
      className={cn(
        'z-50 rounded-lg border-0 bg-popover p-1 text-[13px] text-popover-foreground shadow-menu outline-none',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
