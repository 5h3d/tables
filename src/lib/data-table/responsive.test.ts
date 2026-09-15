import { layoutFor, BREAKPOINTS } from './responsive'

describe('layoutFor', () => {
  it('maps container widths to layouts', () => {
    expect(layoutFor(1200)).toBe('desktop')
    expect(layoutFor(1024)).toBe('desktop')
    expect(layoutFor(1023)).toBe('tablet')
    expect(layoutFor(640)).toBe('tablet')
    expect(layoutFor(639)).toBe('mobile')
    expect(layoutFor(375)).toBe('mobile')
  })
  it('exposes the breakpoints', () => {
    expect(BREAKPOINTS).toEqual({ tablet: 640, desktop: 1024 })
  })
})
