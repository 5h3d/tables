export type PageItem = number | 'ellipsis'

/**
 * 1-based page numbers to render, collapsing runs into an ellipsis.
 * Always shows the first and last page and `siblings` pages either side of
 * the current one; short ranges render every page.
 */
export function pageRange(page: number, pageCount: number, siblings = 1): PageItem[] {
  if (pageCount <= 0) return []
  const total = siblings * 2 + 5 // first, last, current, siblings, two ellipses
  if (pageCount <= total) return Array.from({ length: pageCount }, (_, i) => i + 1)

  const current = Math.min(Math.max(page, 1), pageCount)
  const leftEdge = siblings + 3 // current is close enough to the start to skip the left ellipsis
  const rightEdge = pageCount - siblings - 2

  if (current < leftEdge) {
    const head = Array.from({ length: siblings * 2 + 2 }, (_, i) => i + 1)
    return [...head, 'ellipsis', pageCount]
  }
  if (current > rightEdge) {
    const size = siblings * 2 + 2
    const tail = Array.from({ length: size }, (_, i) => pageCount - size + 1 + i)
    return [1, 'ellipsis', ...tail]
  }
  const middle = Array.from({ length: siblings * 2 + 1 }, (_, i) => current - siblings + i)
  return [1, 'ellipsis', ...middle, 'ellipsis', pageCount]
}
