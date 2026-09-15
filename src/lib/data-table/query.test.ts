import { toSearchParams, fromSearchParams, type TableQuery } from './query'

const defaults: TableQuery = { page: 1, pageSize: 10, filters: {} }

describe('query codec', () => {
  it('serialises a full query', () => {
    const q: TableQuery = {
      page: 2,
      pageSize: 20,
      sort: { id: 'createdAt', desc: true },
      q: 'ann',
      filters: { status: ['active', 'pending'], role: ['admin'] },
    }
    expect(toSearchParams(q).toString()).toBe(
      'page=2&size=20&sort=createdAt.desc&q=ann&f.status=active%2Cpending&f.role=admin',
    )
  })
  it('omits defaults and empty values', () => {
    expect(toSearchParams({ ...defaults, q: '' }, defaults).toString()).toBe('')
    expect(toSearchParams({ ...defaults, page: 3 }, defaults).toString()).toBe('page=3')
    const sorted = { ...defaults, sort: { id: 'name', desc: false } }
    expect(toSearchParams(sorted, sorted).toString()).toBe('')
    expect(toSearchParams({ ...sorted, sort: { id: 'name', desc: true } }, sorted).toString()).toBe('sort=name.desc')
  })
  it('round-trips', () => {
    const q: TableQuery = {
      page: 4,
      pageSize: 50,
      sort: { id: 'name', desc: false },
      q: 'a b',
      filters: { status: ['suspended'] },
    }
    expect(fromSearchParams(toSearchParams(q), defaults)).toEqual(q)
  })
  it('ignores garbage and clamps page to 1', () => {
    const sp = new URLSearchParams('page=-3&size=abc&sort=nonsense&f.=x')
    expect(fromSearchParams(sp, defaults)).toEqual({ page: 1, pageSize: 10, filters: {} })
  })
})
