import * as React from 'react'
import { DataTable, type Density, type MobileMode } from '@/components/data-table'
import type { Layout } from '@/components/data-table/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { NativeSelect } from '@/components/ui/native-select'
import { useDataTable } from '@/hooks/use-data-table'
import { users } from '../data'
import { userColumns } from '../columns'
import { PageIntro, Toast, useToast } from '../ui'

const WIDTHS: Record<Exclude<Layout, never>, number> = { desktop: 1200, tablet: 768, mobile: 375 }

/**
 * Responsive playground: force a layout or drag the container width, switch
 * mobile mode between cards and scroll, and try density + zebra.
 */
function readParams() {
  const sp = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
  const layout = sp.get('layout')
  const mobile = sp.get('mobile')
  const density = sp.get('density')
  return {
    layout: (['auto', 'desktop', 'tablet', 'mobile'].includes(layout ?? '') ? layout : 'auto') as 'auto' | Layout,
    mobile: (mobile === 'scroll' ? 'scroll' : 'cards') as MobileMode,
    density: (['compact', 'comfortable', 'spacious'].includes(density ?? '') ? density : 'comfortable') as Density,
    zebra: sp.get('zebra') === '1',
  }
}

export function PlaygroundPage() {
  const [initial] = React.useState(readParams)
  const [layout, setLayout] = React.useState<'auto' | Layout>(initial.layout)
  const [width, setWidth] = React.useState<number | null>(null)
  const [mobile, setMobile] = React.useState<MobileMode>(initial.mobile)
  const [density, setDensity] = React.useState<Density>(initial.density)
  const [zebra, setZebra] = React.useState(initial.zebra)

  React.useEffect(() => {
    const sp = new URLSearchParams()
    if (layout !== 'auto') sp.set('layout', layout)
    if (mobile !== 'cards') sp.set('mobile', mobile)
    if (density !== 'comfortable') sp.set('density', density)
    if (zebra) sp.set('zebra', '1')
    const q = sp.toString()
    window.history.replaceState(null, '', `#playground${q ? `?${q}` : ''}`)
  }, [layout, mobile, density, zebra])
  const { toast, show } = useToast()
  const instance = useDataTable({ mode: 'client', data: users, columns: userColumns, initialState: { sort: { id: 'name', desc: false } } })

  const containerWidth = layout === 'auto' ? width : WIDTHS[layout]

  return (
    <>
      <PageIntro
        title="Responsive playground"
        description="The table measures its own container (not the viewport). Force a layout, or drag the width slider to watch the table fold, then switch to cards or a pinned scroll view."
      />
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg bg-card px-4 py-3 text-[13px] shadow-card">
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Layout</span>
          <NativeSelect value={layout} onChange={(e) => setLayout(e.target.value as 'auto' | Layout)} className="h-8 [&>select]:h-8">
            <option value="auto">auto (measure)</option>
            <option value="desktop">desktop</option>
            <option value="tablet">tablet</option>
            <option value="mobile">mobile</option>
          </NativeSelect>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Width</span>
          <input
            type="range"
            min={320}
            max={1200}
            step={1}
            value={containerWidth ?? 1200}
            disabled={layout !== 'auto'}
            onChange={(e) => setWidth(Number(e.target.value))}
            aria-label="Container width"
          />
          <span className="w-16 tabular-nums">{containerWidth ? `${containerWidth}px` : 'full'}</span>
          {layout === 'auto' && width !== null && (
            <Button variant="link" size="sm" onClick={() => setWidth(null)}>
              full
            </Button>
          )}
        </label>
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Mobile</span>
          <NativeSelect value={mobile} onChange={(e) => setMobile(e.target.value as MobileMode)} className="h-8 [&>select]:h-8">
            <option value="cards">cards</option>
            <option value="scroll">scroll</option>
          </NativeSelect>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Density</span>
          <NativeSelect value={density} onChange={(e) => setDensity(e.target.value as Density)} className="h-8 [&>select]:h-8">
            <option value="compact">compact</option>
            <option value="comfortable">comfortable</option>
            <option value="spacious">spacious</option>
          </NativeSelect>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox checked={zebra} onCheckedChange={setZebra} aria-label="Zebra" />
          Zebra
        </label>
      </div>
      <div className="overflow-x-auto">
        <div style={{ width: containerWidth ?? undefined, maxWidth: '100%' }}>
          <DataTable
            instance={instance}
            layout={layout}
            mobile={mobile}
            density={density}
            zebra={zebra}
            title="Users"
            entity={{ singular: 'user', plural: 'users' }}
            actions={<Button onClick={() => show('Add user clicked')}>Add user</Button>}
            bulkActions={(sel) => (
              <>
                <Button variant="outline" size="sm" onClick={() => show(`Exported ${sel.count} users`)}>
                  Export
                </Button>
                <Button variant="destructive-outline" size="sm" onClick={() => show(`Would delete ${sel.count} users`)}>
                  Delete
                </Button>
              </>
            )}
            rowActions={(row) => [
              { label: 'View', onSelect: () => show(`View ${row.original.name}`) },
              { label: 'Edit', onSelect: () => show(`Edit ${row.original.name}`) },
              { label: 'Delete', destructive: true, separatorBefore: true, onSelect: () => show(`Would delete ${row.original.name}`) },
            ]}
          />
        </div>
      </div>
      <Toast toast={toast} />
    </>
  )
}
