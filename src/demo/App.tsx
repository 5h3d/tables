import * as React from 'react'
import { cn } from '@/lib/utils'
import { ClientPage } from './pages/client'
import { PlaygroundPage } from './pages/playground'
import { ServerPage } from './pages/server'
import { StatesPage } from './pages/states'

const PAGES = [
  { id: 'client', label: 'Client-side', Component: ClientPage },
  { id: 'server', label: 'Server-side', Component: ServerPage },
  { id: 'playground', label: 'Playground', Component: PlaygroundPage },
  { id: 'states', label: 'States', Component: StatesPage },
] as const

type PageId = (typeof PAGES)[number]['id']

function useHashPage(): [PageId, (id: PageId) => void] {
  const read = () => {
    const id = window.location.hash.replace('#', '').split('?')[0]
    return (PAGES.some((p) => p.id === id) ? id : 'client') as PageId
  }
  const [page, setPage] = React.useState<PageId>(read)
  React.useEffect(() => {
    const onHash = () => setPage(read())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return [page, (id) => (window.location.hash = id)]
}

export function App() {
  const [page, setPage] = useHashPage()
  const Current = PAGES.find((p) => p.id === page)!.Component
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <a href="#client" className="flex items-center gap-2 font-semibold text-foreground">
            <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">T</span>
            Tables
          </a>
          <nav aria-label="Demos" className="flex flex-wrap gap-1">
            {PAGES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPage(p.id)}
                aria-current={p.id === page ? 'page' : undefined}
                className={cn(
                  'cursor-pointer rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground',
                  p.id === page && 'bg-secondary text-foreground',
                )}
              >
                {p.label}
              </button>
            ))}
          </nav>
          <a
            href="https://github.com/5h3d/tables"
            className="ml-auto text-[13px] font-medium text-muted-foreground hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Current key={page} />
      </main>
    </div>
  )
}
