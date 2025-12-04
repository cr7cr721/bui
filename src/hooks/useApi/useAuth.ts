// hooks/useApi/useAuth.ts
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services'
import { useStore } from '@/store/useStore'

export const useUser = () => {
  const token = useStore((state) => state.token)

  return useQuery({
    queryKey: ['user'],
    queryFn: authService.getUser,
    staleTime: 1000 * 60 * 5,
    enabled: !!token,
  })
}

export const useVersion = () => {
  return useQuery({
    queryKey: ['version'],
    queryFn: authService.getVersion,
    staleTime: 1000 * 60 * 60,
  })
}

export const useLogout = () => {
  const clearAuth = useStore((state) => state.clearAuth)
  const queryClient = useQueryClient()

  return () => {
    clearAuth()
    queryClient.removeQueries({ queryKey: ['user'] })
  }
}
