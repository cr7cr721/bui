// hooks/useApi/useAuth.ts
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services'

export const useUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: authService.getUser,
        staleTime: 1000 * 60 * 5,
    })
}

export const useVersion = () => {
    return useQuery({
        queryKey: ['version'],
        queryFn: authService.getVersion,
        staleTime: 1000 * 60 * 60,
    })
}