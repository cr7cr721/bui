import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'

export const useUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: () => apiClient.getUser(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export const useRegions = () => {
    return useQuery({
        queryKey: ['regions'],
        queryFn: () => apiClient.getRegions(),
        staleTime: 1000 * 60 * 30, // 30 minutes
    })
}

export const useAuthors = (groupId: number) => {
    return useQuery({
        queryKey: ['authors', groupId],
        queryFn: () => apiClient.getAuthors(groupId),
        enabled: !!groupId,
        staleTime: 1000 * 60 * 10, // 10 minutes
    })
}

export const useVersion = () => {
    return useQuery({
        queryKey: ['version'],
        queryFn: () => apiClient.getVersion(),
        staleTime: 1000 * 60 * 60, // 1 hour
    })
}

export const useRules = (regions: string, groupId: number) => {
    return useQuery({
        queryKey: ['rules', regions, groupId],
        queryFn: () => apiClient.getRules(regions, groupId),
        enabled: !!regions && !!groupId,
        staleTime: 1000 * 60 * 2, // 2 minutes
    })
}