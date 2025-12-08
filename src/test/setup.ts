import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from '@/test/mocks/server.ts'
import { useStore } from '@/store/useStore'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  useStore.setState({ token: null, isSignInModalOpen: false }, true)
})
afterAll(() => server.close())
