/* eslint-disable react-refresh/only-export-components */

import { type ReactElement, type ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { useStore } from '@/store/useStore'
import userEventLib from '@testing-library/user-event'

// =============================================================================
// Types
// =============================================================================

type StoreState = ReturnType<typeof useStore.getState>

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
  initialEntries?: string[]
  preloadedState?: Partial<StoreState>
  queryClient?: QueryClient
}

// =============================================================================
// Query Client Factory
// =============================================================================

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 0, // v5: was cacheTime
      },
      mutations: {
        retry: false,
      },
    },
  })

// =============================================================================
// Test Providers Wrapper
// =============================================================================

interface ProvidersProps {
  children: ReactNode
  queryClient?: QueryClient
  initialEntries?: string[]
}

const TestProviders = ({ children, queryClient, initialEntries }: ProvidersProps) => {
  const client = queryClient ?? createTestQueryClient()
  const Router = initialEntries ? MemoryRouter : BrowserRouter
  const routerProps = initialEntries ? { initialEntries } : {}

  return (
    <QueryClientProvider client={client}>
      <MantineProvider>
        <Notifications />
        <Router {...routerProps}>{children}</Router>
      </MantineProvider>
    </QueryClientProvider>
  )
}

// =============================================================================
// Custom Render Function
// =============================================================================

export const renderWithProviders = (
  ui: ReactElement,
  {
    route = '/',
    initialEntries,
    preloadedState,
    queryClient,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  // Set up store state if provided
  if (preloadedState) {
    useStore.setState(
      {
        ...useStore.getState(),
        ...preloadedState,
      },
      true
    )
  }

  // Set route for BrowserRouter
  if (!initialEntries) {
    window.history.pushState({}, '', route)
  }

  const result = render(ui, {
    wrapper: ({ children }) => (
      <TestProviders queryClient={queryClient} initialEntries={initialEntries ?? [route]}>
        {children}
      </TestProviders>
    ),
    ...renderOptions,
  })

  return {
    ...result,
    // Utility to re-render with new props
    rerender: (newUi: ReactElement) =>
      result.rerender(
        <TestProviders queryClient={queryClient} initialEntries={initialEntries ?? [route]}>
          {newUi}
        </TestProviders>
      ),
  }
}

// =============================================================================
// User Event Setup
// =============================================================================

export const setupUser = () =>
  userEventLib.setup({
    advanceTimers: vi.advanceTimersByTime,
  })

// =============================================================================
// Store Helpers
// =============================================================================

export const setStoreState = (state: Partial<StoreState>) => {
  useStore.setState({ ...useStore.getState(), ...state }, true)
}

export const getStoreState = () => useStore.getState()

// =============================================================================
// Async Helpers
// =============================================================================

export const waitForLoadingToFinish = () =>
  screen.findByRole('main', {}, { timeout: 5000 }).catch(() => {
    // No main role found, that's okay
  })

// =============================================================================
// Re-exports
// =============================================================================

export * from '@testing-library/react'
export { userEventLib as userEvent }
export { screen } from '@testing-library/react'

// Import vi for use in setupUser
import { vi } from 'vitest'
import { screen } from '@testing-library/react'
