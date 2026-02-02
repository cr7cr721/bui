// hooks/useApi/__tests__/useGroups.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { useCreateGroup, useUpdateGroup } from '@/hooks/useApi/useGroups'
import { groupsService } from '@/services'

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

describe('useCreateGroup', () => {
  it('creates group and invalidates user', async () => {
    const { queryClient, wrapper } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    vi.spyOn(groupsService, 'create').mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useCreateGroup(), { wrapper })

    const data = { fullname: 'My Group', ad_group: 'AD-MY', public: false }
    result.current.mutate(data)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(groupsService.create).toHaveBeenCalledTimes(1)
    expect(vi.mocked(groupsService.create).mock.calls[0]?.[0]).toEqual(data)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user'] })
  })
})

describe('useUpdateGroup', () => {
  it('updates group and invalidates user', async () => {
    const { queryClient, wrapper } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    vi.spyOn(groupsService, 'update').mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useUpdateGroup(), { wrapper })

    const data = { fullname: 'Updated', ad_group: 'AD-UPD', public: true }
    result.current.mutate({ groupId: 42, data })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(groupsService.update).toHaveBeenCalledTimes(1)
    expect(vi.mocked(groupsService.update).mock.calls[0]?.[0]).toBe(42)
    expect(vi.mocked(groupsService.update).mock.calls[0]?.[1]).toEqual(data)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user'] })
  })
})
