// services/rules.service.ts
import { httpClient } from '@/services'
import type {
  Rule,
  RuleTrigger,
  CreateRulePayload,
  RuleResponse,
  RuleHistoryEntry,
  StopStep,
  RuntimePreviewResult,
} from '@/types/api'

export const rulesService = {
  getRules: (regions: string, groupId: number) =>
    httpClient.get<Rule[]>('/rules', { regions, group: groupId }),

  getRule: (ruleId: number, version?: number) =>
    httpClient.get<RuleResponse>(`/rules/${ruleId}`, version ? { version } : undefined),

  createRule: (groupId: number, rule: CreateRulePayload) =>
    httpClient.post<{ id: number }>(`/rules`, rule, { group: groupId }),

  updateRule: (ruleId: number, rule: CreateRulePayload) =>
    httpClient.post<void>(`/rules/${ruleId}`, rule),

  enableRule: (ruleId: number, region: string) =>
    httpClient.post<void>(`/rules/${ruleId}/enable/${region}`),

  disableRule: (ruleId: number, region: string) =>
    httpClient.post<void>(`/rules/${ruleId}/disable/${region}`),

  validateRule: (ruleJson: string) =>
    httpClient.post<{ valid: boolean; messages: string[] }>('/validate', ruleJson, undefined, {
      'Content-Type': 'application/json',
    }),

  getAuthors: (groupId: number) =>
    httpClient.get<string[]>('/rules/values/author', { group: groupId }),

  getTriggers: (ruleId: number) => httpClient.get<RuleTrigger[]>(`/rules/${ruleId}/triggers`),

  moveToGroup: (ruleId: number, groupId: number) =>
    httpClient.post<void>(`/rules/${ruleId}/setgroup`, undefined, { group: groupId }),

  delete: (ruleId: number) => httpClient.post<void>(`/rules/${ruleId}/delete`),

  bulkMoveToGroup: async (ruleIds: number[], groupId: number) => {
    await Promise.all(ruleIds.map((ruleId) => rulesService.moveToGroup(ruleId, groupId)))
  },

  bulkDelete: async (ruleIds: number[]) => {
    await Promise.all(ruleIds.map((ruleId) => rulesService.delete(ruleId)))
  },

  getHistory: (ruleId: number) => httpClient.get<RuleHistoryEntry[]>(`/rules/${ruleId}/history`),

  runRule: (rule: CreateRulePayload, stop: StopStep) =>
    httpClient.post<RuntimePreviewResult>('/run', rule, { stop }),
}
