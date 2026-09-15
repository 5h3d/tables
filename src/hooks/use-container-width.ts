import * as React from 'react'

/**
 * Width of an element, kept current with ResizeObserver. Measured
 * synchronously on mount so the first paint already uses the real width.
 */
export function useContainerWidth<T extends HTMLElement>(ref: React.RefObject<T | null>): number | null {
  const [width, setWidth] = React.useState<number | null>(null)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.getBoundingClientRect().width)
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (typeof w === 'number') setWidth(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return width
}
