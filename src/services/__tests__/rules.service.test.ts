import { describe, it, expect, vi } from 'vitest'
import { httpClient, rulesService } from '@/services'

vi.mock('../http-client', () => ({ httpClient: { get: vi.fn(), post: vi.fn() } }))

describe('rulesService', () => {
  it.skip('calls getRules', async () => {
    httpClient.get.mockResolvedValueOnce([])
    await rulesService.getRules('NA', 1)
    expect(httpClient.get).toHaveBeenCalled()
  })
})
