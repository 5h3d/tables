export type Layout = 'desktop' | 'tablet' | 'mobile'

/** Container-width breakpoints (px). Widths below `tablet` are mobile. */
export const BREAKPOINTS = { tablet: 640, desktop: 1024 } as const

export function layoutFor(width: number): Layout {
  if (width >= BREAKPOINTS.desktop) return 'desktop'
  if (width >= BREAKPOINTS.tablet) return 'tablet'
  return 'mobile'
}
