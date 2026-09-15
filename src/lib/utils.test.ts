import { cn } from './utils'

describe('cn', () => {
  it('joins class names and drops falsy values', () => {
    const hidden = false as boolean
    expect(cn('a', hidden && 'b', undefined, 'c')).toBe('a c')
  })
  it('lets later tailwind utilities win over conflicting earlier ones', () => {
    expect(cn('px-2 text-sm', 'px-4')).toBe('text-sm px-4')
  })
})
