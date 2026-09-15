import * as React from 'react'
import { cn } from '@/lib/utils'

/** Native <select> with a custom chevron; keeps the OS picker on mobile. */
export function NativeSelect({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <span data-slot="native-select" className={cn('relative inline-flex', className)}>
      <select
        className="h-9 w-full cursor-pointer appearance-none rounded-md border border-input bg-background py-0 pr-8 pl-3 text-[13px] text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
      >
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
