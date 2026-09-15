import { pageRange } from './pagination'

describe('pageRange', () => {
  it('returns every page when there are few pages', () => {
    expect(pageRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })
  it('collapses the tail when on the first pages', () => {
    expect(pageRange(1, 8)).toEqual([1, 2, 3, 4, 'ellipsis', 8])
    expect(pageRange(2, 8)).toEqual([1, 2, 3, 4, 'ellipsis', 8])
  })
  it('collapses both sides in the middle', () => {
    expect(pageRange(5, 8)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 8])
  })
  it('collapses the head when on the last pages', () => {
    expect(pageRange(8, 8)).toEqual([1, 'ellipsis', 5, 6, 7, 8])
  })
  it('handles zero pages', () => {
    expect(pageRange(1, 0)).toEqual([])
  })
})
