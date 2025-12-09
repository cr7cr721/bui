// hooks/useApi/useRules.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { rulesService } from '@/services'
import type { CreateRulePayload } from '@/types/api'

export const useRules = (regions: string, groupId: number) => {
  return useQuery({
    queryKey: ['rules', regions, groupId],
    queryFn: () => rulesService.getRules(regions, groupId),
    enabled: !!regions && !!groupId,
    staleTime: 1000 * 60 * 2,
  })
}

export const useRule = (ruleId: number, version?: number) => {
  return useQuery({
    queryKey: ['rule', ruleId, version],
    queryFn: () => rulesService.getRule(ruleId, version),
    enabled: !!ruleId,
  })
}

export const useAuthors = (groupId: number) => {
  return useQuery({
    queryKey: ['authors', groupId],
    queryFn: () => rulesService.getAuthors(groupId),
    enabled: !!groupId,
    staleTime: 1000 * 60 * 10,
  })
}

export const useTriggers = (ruleId: number, enabled = true) => {
  return useQuery({
    queryKey: ['triggers', ruleId],
    queryFn: () => rulesService.getTriggers(ruleId),
    enabled: !!ruleId && enabled,
    staleTime: 1000 * 30,
  })
}

export const useCreateRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, rule }: { groupId: number; rule: CreateRulePayload }) =>
      rulesService.createRule(groupId, rule),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rules'] })
    },
  })
}

export const useUpdateRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ruleId, rule }: { ruleId: number; rule: CreateRulePayload }) =>
      rulesService.updateRule(ruleId, rule),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['rules'] })
      void queryClient.invalidateQueries({ queryKey: ['rule', variables.ruleId] })
    },
  })
}

export const useValidateRule = () => {
  return useMutation({
    mutationFn: (ruleJson: string) => rulesService.validateRule(ruleJson),
  })
}

export const useEnableRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ruleId, region }: { ruleId: number; region: string }) =>
      rulesService.enableRule(ruleId, region),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rules'] })
    },
  })
}

export const useDisableRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ruleId, region }: { ruleId: number; region: string }) =>
      rulesService.disableRule(ruleId, region),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rules'] })
    },
  })
}

export const useMoveRulesToGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ruleIds, groupId }: { ruleIds: number[]; groupId: number }) =>
      rulesService.bulkMoveToGroup(ruleIds, groupId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rules'] })
    },
  })
}

export const useDeleteRules = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ruleIds: number[]) => rulesService.bulkDelete(ruleIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rules'] })
    },
  })
}
