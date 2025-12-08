/* eslint-disable react-refresh/only-export-components */

import { type ReactElement } from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { useStore } from '@/store/useStore'
import userEventLib from '@testing-library/user-event'

// Infer the Zustand store shape
type StoreState = ReturnType<typeof useStore.getState>

const createQC = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })

interface RenderOptions {
  route?: string
  preloadedState?: Partial<StoreState>
}

export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', preloadedState }: RenderOptions = {}
) => {
  if (preloadedState) {
    useStore.setState(
      {
        ...useStore.getState(),
        ...preloadedState,
      },
      true
    )
  }

  window.history.pushState({}, '', route)

  return render(
    <QueryClientProvider client={createQC()}>
      <MantineProvider>
        <BrowserRouter>{ui}</BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  )
}

// Re-export RTL helpers explicitly (no export *)
export * from '@testing-library/react'
export const userEvent = userEventLib
