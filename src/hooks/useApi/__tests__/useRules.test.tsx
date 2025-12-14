// hooks/useApi/__tests__/useRules.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import {
  useRules,
  useRule,
  useAuthors,
  useTriggers,
  useCreateRule,
  useUpdateRule,
  useValidateRule,
  useEnableRule,
  useDisableRule,
  useMoveRulesToGroup,
  useDeleteRules,
} from '@/hooks/useApi/useRules'
import { rulesService } from '@/services'
import { createRules, createRulePayload, createRuleTriggers } from '@/test/mocks/factories'

// =============================================================================
// Test Wrapper Setup
// =============================================================================

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// =============================================================================
// Query Hook Tests
// =============================================================================

describe('useRules', () => {
  it('fetches rules when enabled', async () => {
    const mockRules = createRules(3)
    vi.spyOn(rulesService, 'getRules').mockResolvedValueOnce(mockRules)

    const { result } = renderHook(() => useRules('NA', 1), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockRules)
    expect(rulesService.getRules).toHaveBeenCalledWith('NA', 1)
  })

  it('does not fetch when regions is empty', () => {
    vi.spyOn(rulesService, 'getRules')

    const { result } = renderHook(() => useRules('', 1), {
      wrapper: createWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
    expect(rulesService.getRules).not.toHaveBeenCalled()
  })

  it('does not fetch when groupId is 0', () => {
    vi.spyOn(rulesService, 'getRules')

    const { result } = renderHook(() => useRules('NA', 0), {
      wrapper: createWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
    expect(rulesService.getRules).not.toHaveBeenCalled()
  })
})

describe('useRule', () => {
  it('fetches single rule', async () => {
    const mockResponse = {
      id: 42,
      version: 1,
      body: createRulePayload(),
    }
    vi.spyOn(rulesService, 'getRule').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useRule(42), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockResponse)
    expect(rulesService.getRule).toHaveBeenCalledWith(42, undefined)
  })

  it('fetches specific version when provided', async () => {
    vi.spyOn(rulesService, 'getRule').mockResolvedValueOnce({
      id: 42,
      version: 5,
      body: createRulePayload(),
    })

    const { result } = renderHook(() => useRule(42, 5), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(rulesService.getRule).toHaveBeenCalledWith(42, 5)
  })

  it('does not fetch when ruleId is 0', () => {
    vi.spyOn(rulesService, 'getRule')

    const { result } = renderHook(() => useRule(0), {
      wrapper: createWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
    expect(rulesService.getRule).not.toHaveBeenCalled()
  })
})

describe('useAuthors', () => {
  it('fetches authors for group', async () => {
    const mockAuthors = ['alice@test.com', 'bob@test.com']
    vi.spyOn(rulesService, 'getAuthors').mockResolvedValueOnce(mockAuthors)

    const { result } = renderHook(() => useAuthors(5), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockAuthors)
    expect(rulesService.getAuthors).toHaveBeenCalledWith(5)
  })

  it('does not fetch when groupId is 0', () => {
    vi.spyOn(rulesService, 'getAuthors')

    const { result } = renderHook(() => useAuthors(0), {
      wrapper: createWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
    expect(rulesService.getAuthors).not.toHaveBeenCalled()
  })
})

describe('useTriggers', () => {
  it('fetches triggers when enabled', async () => {
    const mockTriggers = createRuleTriggers(3, 42)
    vi.spyOn(rulesService, 'getTriggers').mockResolvedValueOnce(mockTriggers)

    const { result } = renderHook(() => useTriggers(42), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockTriggers)
  })

  it('can be disabled via enabled parameter', () => {
    vi.spyOn(rulesService, 'getTriggers')

    const { result } = renderHook(() => useTriggers(42, false), {
      wrapper: createWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
    expect(rulesService.getTriggers).not.toHaveBeenCalled()
  })
})

// =============================================================================
// Mutation Hook Tests
// =============================================================================

describe('useCreateRule', () => {
  it('creates rule and invalidates queries', async () => {
    vi.spyOn(rulesService, 'createRule').mockResolvedValueOnce({ id: 999 })

    const { result } = renderHook(() => useCreateRule(), {
      wrapper: createWrapper(),
    })

    const payload = createRulePayload()
    result.current.mutate({ groupId: 1, rule: payload })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({ id: 999 })
    expect(rulesService.createRule).toHaveBeenCalledWith(1, payload)
  })
})

describe('useUpdateRule', () => {
  it('updates rule', async () => {
    vi.spyOn(rulesService, 'updateRule').mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useUpdateRule(), {
      wrapper: createWrapper(),
    })

    const payload = createRulePayload()
    result.current.mutate({ ruleId: 42, rule: payload })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(rulesService.updateRule).toHaveBeenCalledWith(42, payload)
  })
})

describe('useValidateRule', () => {
  it('validates rule JSON', async () => {
    vi.spyOn(rulesService, 'validateRule').mockResolvedValueOnce({
      valid: true,
      messages: [],
    })

    const { result } = renderHook(() => useValidateRule(), {
      wrapper: createWrapper(),
    })

    const ruleJson = JSON.stringify(createRulePayload())
    result.current.mutate(ruleJson)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.valid).toBe(true)
    expect(rulesService.validateRule).toHaveBeenCalledWith(ruleJson)
  })

  it('returns validation errors', async () => {
    vi.spyOn(rulesService, 'validateRule').mockResolvedValueOnce({
      valid: false,
      messages: ['Invalid rule name', 'Missing inputs'],
    })

    const { result } = renderHook(() => useValidateRule(), {
      wrapper: createWrapper(),
    })

    result.current.mutate('{}')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.valid).toBe(false)
    expect(result.current.data?.messages).toHaveLength(2)
  })
})

describe('useEnableRule', () => {
  it('enables rule in region', async () => {
    vi.spyOn(rulesService, 'enableRule').mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useEnableRule(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ ruleId: 42, region: 'NA' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(rulesService.enableRule).toHaveBeenCalledWith(42, 'NA')
  })
})

describe('useDisableRule', () => {
  it('disables rule in region', async () => {
    vi.spyOn(rulesService, 'disableRule').mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDisableRule(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ ruleId: 42, region: 'EU' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(rulesService.disableRule).toHaveBeenCalledWith(42, 'EU')
  })
})

describe('useMoveRulesToGroup', () => {
  it('moves multiple rules to new group', async () => {
    vi.spyOn(rulesService, 'bulkMoveToGroup').mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useMoveRulesToGroup(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ ruleIds: [1, 2, 3], groupId: 10 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(rulesService.bulkMoveToGroup).toHaveBeenCalledWith([1, 2, 3], 10)
  })
})

describe('useDeleteRules', () => {
  it('deletes multiple rules', async () => {
    vi.spyOn(rulesService, 'bulkDelete').mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteRules(), {
      wrapper: createWrapper(),
    })

    result.current.mutate([4, 5, 6])

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(rulesService.bulkDelete).toHaveBeenCalledWith([4, 5, 6])
  })
})
