// services/rules.service.ts
import { httpClient } from '@/services'
import type { Rule, RuleTrigger } from '@/types/api'

export const rulesService = {
  getRules: (regions: string, groupId: number) =>
    httpClient.get<Rule[]>('/rules', { regions, group: groupId }),

  getAuthors: (groupId: number) =>
    httpClient.get<string[]>('/rules/values/author', { group: groupId }),

  getTriggers: (ruleId: number) =>
    httpClient.get<RuleTrigger[]>(`/rules/${ruleId}/triggers`),

  moveToGroup: (ruleId: number, groupId: number) =>
    httpClient.post<void>(`/rules/${ruleId}/setgroup`, undefined, { group: groupId }),

  delete: (ruleId: number) => httpClient.post<void>(`/rules/${ruleId}/delete`),

  bulkMoveToGroup: async (ruleIds: number[], groupId: number) => {
    await Promise.all(ruleIds.map((ruleId) => rulesService.moveToGroup(ruleId, groupId)))
  },

  bulkDelete: async (ruleIds: number[]) => {
    await Promise.all(ruleIds.map((ruleId) => rulesService.delete(ruleId)))
  },
}
