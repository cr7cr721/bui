import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from '@/test/mocks/server'
import { useStore } from '@/store/useStore'
import { setTestSeed } from '@/test/mocks/factories'

// =============================================================================
// Browser API Mocks
// =============================================================================

// Mock matchMedia for Mantine
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  root = null
  rootMargin = ''
  thresholds: number[] = []
}
global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

// Mock scrollTo
window.scrollTo = vi.fn()
Element.prototype.scrollTo = vi.fn()
Element.prototype.scrollIntoView = vi.fn()

// Mock getComputedStyle for Mantine components (simpler version)
const originalGetComputedStyle = window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: (element: Element) => originalGetComputedStyle(element),
})

// =============================================================================
// MSW Server Setup
// =============================================================================

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

beforeEach(() => {
  // Set consistent seed for reproducible tests
  setTestSeed()
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  // Reset Zustand store to initial state
  useStore.setState({
    token: null,
    isSignInModalOpen: false,
    filters: {
      region: 'DEV',
      group: '1',
      search: '',
      enabled: 'all',
      author: '',
    },
    selectedRules: [],
  })
  vi.clearAllMocks()
})

afterAll(() => {
  server.close()
})

// =============================================================================
// Console Suppression (optional - for cleaner test output)
// =============================================================================

// Suppress specific console errors during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    // Suppress React 18 act warnings and known test noise
    const message = args[0]?.toString() || ''
    if (
      message.includes('Warning: ReactDOM.render is no longer supported') ||
      message.includes('Warning: An update to') ||
      message.includes('inside a test was not wrapped in act')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
