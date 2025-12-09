// hooks/useApi/useRules.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { rulesService } from '@/services'

export const useRules = (regions: string, groupId: number) => {
  return useQuery({
    queryKey: ['rules', regions, groupId],
    queryFn: () => rulesService.getRules(regions, groupId),
    enabled: !!regions && !!groupId,
    staleTime: 1000 * 60 * 2,
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
    staleTime: 1000 * 30, // 30 seconds - triggers change frequently
  })
}

export const useMoveRulesToGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ruleIds, groupId }: { ruleIds: number[]; groupId: number }) =>
      rulesService.bulkMoveToGroup(ruleIds, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] })
    },
  })
}

export const useDeleteRules = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ruleIds: number[]) => rulesService.bulkDelete(ruleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] })
    },
  })
}
