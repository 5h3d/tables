import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full py-[3px] pr-2.5 pl-2 text-xs font-medium whitespace-nowrap before:size-1.5 before:rounded-full before:bg-current before:content-[""]',
  {
    variants: {
      variant: {
        neutral: 'bg-secondary text-muted-foreground before:bg-faint',
        success: 'bg-success-bg text-success before:bg-success-dot',
        warning: 'bg-warning-bg text-warning before:bg-warning-dot',
        destructive: 'bg-danger-bg text-danger before:bg-danger-dot',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

export type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}
