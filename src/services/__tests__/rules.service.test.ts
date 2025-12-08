import { describe, it, expect, vi, beforeEach } from 'vitest'
import { httpClient, rulesService } from '@/services'
import type { Rule } from '@/types/api'

describe('rulesService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls httpClient.get with correct args', async () => {
    // Spy on the real httpClient instance
    const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValueOnce([] as Rule[])

    await rulesService.getRules('NA', 1)

    expect(getSpy).toHaveBeenCalledTimes(1)
    expect(getSpy).toHaveBeenCalledWith('/rules', {
      regions: 'NA',
      group: 1,
    })
  })
})
