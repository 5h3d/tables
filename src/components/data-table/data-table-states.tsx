import * as React from 'react'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { cn } from '../../lib/utils'
import { useDataTableContext } from './data-table-context'

export type EmptyStateRenderer = (ctx: { query: string | undefined; filtered: boolean; clear: () => void }) => React.ReactNode
export type ErrorStateRenderer = (ctx: { error: Error; retry: () => void }) => React.ReactNode

export function DataTableEmpty({ render }: { render?: EmptyStateRenderer }) {
  const { instance, entity } = useDataTableContext()
  const q = instance.query.q
  const hasFilters = Object.keys(instance.query.filters).length > 0
  const filtered = Boolean(q) || hasFilters
  const clear = () => {
    instance.setSearch('')
    instance.clearFilters()
  }
  if (render) return <>{render({ query: q, filtered, clear })}</>
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex size-9 items-center justify-center rounded-full bg-secondary text-faint">
        <svg viewBox="0 0 16 16" aria-hidden className="size-4">
          <circle cx="8" cy="8" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-foreground">
        {q ? (
          <>
            No {entity.plural} match &ldquo;{q}&rdquo;
          </>
        ) : hasFilters ? (
          <>No {entity.plural} match these filters</>
        ) : (
          <>No {entity.plural} yet</>
        )}
      </p>
      {filtered && (
        <>
          <p className="mt-1 max-w-64 text-[13px] text-muted-foreground">
            Try a different search term or clear your filters to see all {entity.plural}.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={clear}>
            {q && !hasFilters ? 'Clear search' : 'Clear filters'}
          </Button>
        </>
      )}
    </div>
  )
}

export function DataTableError({
  render,
  support,
}: {
  render?: ErrorStateRenderer
  /** Secondary action next to Retry, e.g. a "Contact support" link. */
  support?: React.ReactNode
}) {
  const { instance, entity } = useDataTableContext()
  const error = instance.error ?? new Error('Something went wrong')
  if (render) return <>{render({ error, retry: instance.refetch })}</>
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex size-9 items-center justify-center rounded-full bg-danger-bg text-destructive">
        <svg viewBox="0 0 16 16" aria-hidden className="size-4">
          <path d="M8 4.5v4M8 11.2v.3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-foreground">Couldn&rsquo;t load {entity.plural}</p>
      <p className="mt-1 max-w-64 text-[13px] text-muted-foreground">
        {error.message || 'The request failed. Check your connection and try again.'}
      </p>
      <div className="mt-4 flex items-center gap-2">
        <Button size="sm" onClick={instance.refetch}>
          Retry
        </Button>
        {support}
      </div>
    </div>
  )
}

/** Skeleton rows for the grid layout. */
export function DataTableSkeletonRows({ columns, rows = 6, selectable, actions }: { columns: number; rows?: number; selectable: boolean; actions: boolean }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} className="border-b border-border last:border-0" aria-hidden>
          {selectable && (
            <td className="w-11 px-3 py-[var(--dt-row-py,12px)]">
              <Skeleton className="size-4 rounded-[4px]" />
            </td>
          )}
          {Array.from({ length: columns }, (_, c) => (
            <td key={c} className="px-3 py-[var(--dt-row-py,12px)]">
              <div className="flex items-center gap-2.5">
                {c === 0 && <Skeleton className="size-7 rounded-full" />}
                <Skeleton className={cn('h-3 rounded-full', c === 0 ? 'w-28' : c % 2 ? 'w-20' : 'w-16')} />
              </div>
            </td>
          ))}
          {actions && <td className="w-12" />}
        </tr>
      ))}
    </>
  )
}

/** Skeleton cards for the mobile cards layout. */
export function DataTableSkeletonCards({ rows = 5, selectable }: { rows?: number; selectable: boolean }) {
  return (
    <ul aria-hidden className="divide-y divide-border">
      {Array.from({ length: rows }, (_, r) => (
        <li key={r} className="flex gap-3 px-4 py-3.5">
          {selectable && <Skeleton className="mt-0.5 size-4 rounded-[4px]" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32 rounded-full" />
            <Skeleton className="h-3 w-44 rounded-full" />
            <Skeleton className="h-2.5 w-36 rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  )
}
