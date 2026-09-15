import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Native <button> styled the shadcn way. Swap for shadcn's Radix/Slot version
 * later if you need `asChild`; the variant names line up.
 */
export const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-semibold transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        outline: 'border border-input bg-background text-foreground hover:bg-secondary',
        'destructive-outline':
          'border border-danger-border bg-background text-destructive hover:bg-danger-bg',
        ghost: 'text-foreground hover:bg-secondary',
        link: 'text-muted-foreground hover:text-foreground',
      },
      size: {
        sm: 'h-8 px-2.5 text-[13px]',
        md: 'h-9 px-3 text-sm',
        icon: 'size-8 rounded-md',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
)

export type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
