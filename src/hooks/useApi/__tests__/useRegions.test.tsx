// hooks/useApi/__tests__/useRegions.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import {
  useRegions,
  useChromieRegions,
  useDisabledRegions,
  useToggleRegion,
} from '@/hooks/useApi/useRegions'
import { regionsService } from '@/services'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  }
}

describe('useRegions', () => {
  it('fetches regions list', async () => {
    const mockRegions = [
      { id: 1, name: 'NA', fullname: 'North America' },
      { id: 2, name: 'EU', fullname: 'Europe' },
    ]
    vi.spyOn(regionsService, 'getAll').mockResolvedValueOnce(mockRegions as never)

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useRegions(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockRegions)
    expect(regionsService.getAll).toHaveBeenCalledTimes(1)
  })
})

describe('useChromieRegions', () => {
  it('fetches chromie regions list', async () => {
    vi.spyOn(regionsService, 'getChromieRegions').mockResolvedValueOnce(['NA', 'EU'])

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useChromieRegions(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(['NA', 'EU'])
  })
})

describe('useDisabledRegions', () => {
  it('fetches disabled regions list', async () => {
    vi.spyOn(regionsService, 'getDisabled').mockResolvedValueOnce(['DEV'])

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useDisabledRegions(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(['DEV'])
  })
})

describe('useToggleRegion', () => {
  it('toggles region and invalidates disabled-regions query', async () => {
    const { queryClient, wrapper } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    vi.spyOn(regionsService, 'toggle').mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useToggleRegion(), { wrapper })

    result.current.mutate({ region: 'NA', enable: true })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(regionsService.toggle).toHaveBeenCalledWith('NA', true)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['disabled-regions'] })
  })
})
