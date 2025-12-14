import { describe, it, expect, vi, beforeEach } from 'vitest'
import { httpClient, rulesService } from '@/services'
import type { RuleResponse } from '@/types/api'
import { createRules, createRulePayload, createRuleTriggers } from '@/test/mocks/factories'

describe('rulesService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('getRules', () => {
    it('calls httpClient.get with correct args', async () => {
      const mockRules = createRules(3)
      const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValueOnce(mockRules)

      const result = await rulesService.getRules('NA', 1)

      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(getSpy).toHaveBeenCalledWith('/rules', {
        regions: 'NA',
        group: 1,
      })
      expect(result).toEqual(mockRules)
    })

    it('handles multiple regions', async () => {
      const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValueOnce([])

      await rulesService.getRules('NA,EU,KR', 5)

      expect(getSpy).toHaveBeenCalledWith('/rules', {
        regions: 'NA,EU,KR',
        group: 5,
      })
    })
  })

  describe('getRule', () => {
    it('fetches rule without version', async () => {
      const mockResponse: RuleResponse = {
        id: 42,
        version: 1,
        body: createRulePayload(),
      }
      const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValueOnce(mockResponse)

      const result = await rulesService.getRule(42)

      expect(getSpy).toHaveBeenCalledWith('/rules/42', undefined)
      expect(result).toEqual(mockResponse)
    })

    it('fetches specific rule version', async () => {
      const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValueOnce({})

      await rulesService.getRule(42, 5)

      expect(getSpy).toHaveBeenCalledWith('/rules/42', { version: 5 })
    })
  })

  describe('createRule', () => {
    it('creates rule with correct payload', async () => {
      const payload = createRulePayload({ name: 'New Test Rule' })
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValueOnce({ id: 999 })

      const result = await rulesService.createRule(1, payload)

      expect(postSpy).toHaveBeenCalledWith('/rules', payload, { group: 1 })
      expect(result).toEqual({ id: 999 })
    })
  })

  describe('updateRule', () => {
    it('updates rule with correct payload', async () => {
      const payload = createRulePayload({ name: 'Updated Rule' })
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValueOnce(undefined)

      await rulesService.updateRule(42, payload)

      expect(postSpy).toHaveBeenCalledWith('/rules/42', payload)
    })
  })

  describe('enableRule / disableRule', () => {
    it('enables rule in specific region', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValueOnce(undefined)

      await rulesService.enableRule(42, 'NA')

      expect(postSpy).toHaveBeenCalledWith('/rules/42/enable/NA')
    })

    it('disables rule in specific region', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValueOnce(undefined)

      await rulesService.disableRule(42, 'EU')

      expect(postSpy).toHaveBeenCalledWith('/rules/42/disable/EU')
    })
  })

  describe('validateRule', () => {
    it('sends JSON string for validation', async () => {
      const ruleJson = JSON.stringify(createRulePayload())
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValueOnce({
        valid: true,
        messages: [],
      })

      const result = await rulesService.validateRule(ruleJson)

      expect(postSpy).toHaveBeenCalledWith('/validate', ruleJson, undefined, {
        'Content-Type': 'application/json',
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('getAuthors', () => {
    it('fetches authors for group', async () => {
      const mockAuthors = ['alice@test.com', 'bob@test.com']
      const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValueOnce(mockAuthors)

      const result = await rulesService.getAuthors(5)

      expect(getSpy).toHaveBeenCalledWith('/rules/values/author', { group: 5 })
      expect(result).toEqual(mockAuthors)
    })
  })

  describe('getTriggers', () => {
    it('fetches triggers for rule', async () => {
      const mockTriggers = createRuleTriggers(3, 42)
      const getSpy = vi.spyOn(httpClient, 'get').mockResolvedValueOnce(mockTriggers)

      const result = await rulesService.getTriggers(42)

      expect(getSpy).toHaveBeenCalledWith('/rules/42/triggers')
      expect(result).toEqual(mockTriggers)
    })
  })

  describe('moveToGroup', () => {
    it('moves rule to new group', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValueOnce(undefined)

      await rulesService.moveToGroup(42, 10)

      expect(postSpy).toHaveBeenCalledWith('/rules/42/setgroup', undefined, { group: 10 })
    })
  })

  describe('delete', () => {
    it('deletes rule', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValueOnce(undefined)

      await rulesService.delete(42)

      expect(postSpy).toHaveBeenCalledWith('/rules/42/delete')
    })
  })

  describe('bulk operations', () => {
    it('bulkMoveToGroup moves multiple rules', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(undefined)

      await rulesService.bulkMoveToGroup([1, 2, 3], 10)

      expect(postSpy).toHaveBeenCalledTimes(3)
      expect(postSpy).toHaveBeenCalledWith('/rules/1/setgroup', undefined, { group: 10 })
      expect(postSpy).toHaveBeenCalledWith('/rules/2/setgroup', undefined, { group: 10 })
      expect(postSpy).toHaveBeenCalledWith('/rules/3/setgroup', undefined, { group: 10 })
    })

    it('bulkDelete deletes multiple rules', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(undefined)

      await rulesService.bulkDelete([4, 5, 6])

      expect(postSpy).toHaveBeenCalledTimes(3)
      expect(postSpy).toHaveBeenCalledWith('/rules/4/delete')
      expect(postSpy).toHaveBeenCalledWith('/rules/5/delete')
      expect(postSpy).toHaveBeenCalledWith('/rules/6/delete')
    })

    it('bulkMoveToGroup handles empty array', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(undefined)

      await rulesService.bulkMoveToGroup([], 10)

      expect(postSpy).not.toHaveBeenCalled()
    })
  })
})
