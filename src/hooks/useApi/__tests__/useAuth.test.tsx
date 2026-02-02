// hooks/useApi/__tests__/useAuth.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import { useUser, useVersion, useLogin, useLogout } from '@/hooks/useApi/useAuth'
import { authService } from '@/services'
import { useStore } from '@/store/useStore'

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

describe('useUser', () => {
  it('fetches user when token exists', async () => {
    useStore.setState({ token: 'test-token' })

    const mockUser = { id: 1, user: 'test', groups: [] }
    vi.spyOn(authService, 'getUser').mockResolvedValueOnce(mockUser as never)

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useUser(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockUser)
    expect(authService.getUser).toHaveBeenCalledTimes(1)
  })

  it('does not fetch when token is null', () => {
    useStore.setState({ token: null })

    vi.spyOn(authService, 'getUser')

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useUser(), { wrapper })

    expect(result.current.isFetching).toBe(false)
    expect(authService.getUser).not.toHaveBeenCalled()
  })
})

describe('useVersion', () => {
  it('fetches version string', async () => {
    vi.spyOn(authService, 'getVersion').mockResolvedValueOnce('1.2.3' as never)

    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useVersion(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual('1.2.3')
    expect(authService.getVersion).toHaveBeenCalledTimes(1)
  })
})

describe('useLogin', () => {
  it('stores token and invalidates user query on success', async () => {
    const { queryClient, wrapper } = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    vi.spyOn(authService, 'login').mockResolvedValueOnce({ token: 'new-token' })

    const { result } = renderHook(() => useLogin(), { wrapper })

    result.current.mutate({ user: 'u', password: 'p' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(useStore.getState().token).toBe('new-token')
    expect(authService.login).toHaveBeenCalledTimes(1)
    expect(vi.mocked(authService.login).mock.calls[0]?.[0]).toEqual({ user: 'u', password: 'p' })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user'] })
  })
})

describe('useLogout', () => {
  it('clears auth and removes user query', () => {
    useStore.setState({ token: 'existing-token', selectedRules: [1, 2, 3] })

    const { queryClient, wrapper } = createWrapper()
    const removeSpy = vi.spyOn(queryClient, 'removeQueries')

    const { result } = renderHook(() => useLogout(), { wrapper })

    result.current()

    expect(useStore.getState().token).toBe(null)
    expect(useStore.getState().selectedRules).toEqual([])
    expect(removeSpy).toHaveBeenCalledWith({ queryKey: ['user'] })
  })
})
