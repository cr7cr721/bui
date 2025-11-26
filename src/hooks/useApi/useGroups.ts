// hooks/useApi/useGroups.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsService } from '@/services'
import type { GroupData } from '@/services'

export const useCreateGroup = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: groupsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] })
        }
    })
}

export const useUpdateGroup = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ groupId, data }: { groupId: number; data: GroupData }) =>
            groupsService.update(groupId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] })
        }
    })
}