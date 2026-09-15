import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())

// jsdom lacks ResizeObserver and the popover API; provide minimal stand-ins.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (!('ResizeObserver' in globalThis)) {
  ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub
}
if (!('showPopover' in HTMLElement.prototype)) {
  Object.assign(HTMLElement.prototype, {
    showPopover() {
      ;(this as HTMLElement).style.display = 'block'
    },
    hidePopover() {
      ;(this as HTMLElement).style.display = ''
    },
  })
}
