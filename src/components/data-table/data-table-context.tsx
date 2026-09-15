import * as React from 'react'
import type { Row } from '@tanstack/react-table'
import type { MenuItem } from '@/components/ui/menu'
import type { DataTableInstance } from '@/hooks/use-data-table'
import type { Layout } from './types'

export type Density = 'compact' | 'comfortable' | 'spacious'
export type MobileMode = 'cards' | 'scroll'
export type Entity = { singular: string; plural: string }

export type DataTableContextValue<TData> = {
  instance: DataTableInstance<TData>
  layout: Layout
  mobile: MobileMode
  density: Density
  zebra: boolean
  entity: Entity
  selectable: boolean
  rowActions?: (row: Row<TData>) => MenuItem[]
  card?: (row: Row<TData>) => React.ReactNode
  pageSizeOptions: number[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DataTableContext = React.createContext<DataTableContextValue<any> | null>(null)

export function DataTableProvider<TData>({
  value,
  children,
}: {
  value: DataTableContextValue<TData>
  children: React.ReactNode
}) {
  return <DataTableContext.Provider value={value}>{children}</DataTableContext.Provider>
}

export function useDataTableContext<TData = unknown>(): DataTableContextValue<TData> {
  const ctx = React.useContext(DataTableContext)
  if (!ctx) throw new Error('DataTable parts must be rendered inside <DataTable>')
  return ctx as DataTableContextValue<TData>
}
