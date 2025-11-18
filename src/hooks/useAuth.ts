import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { useStore } from '@/store/useStore'

interface LoginCredentials {
    user: string
    password: string
}

interface LoginResponse {
    token: string
}

export const useLogin = () => {
    const queryClient = useQueryClient()
    const { setAuthToken } = useStore()

    return useMutation<LoginResponse, Error, LoginCredentials>({
        mutationFn: (credentials) => apiClient.login(credentials),
        onSuccess: (data) => {
            // Store token in Zustand persist store
            setAuthToken(data.token)

            // Invalidate user query to refetch user data with new token
            queryClient.invalidateQueries({ queryKey: ['user'] })
        },
        onError: (error) => {
            console.error('Login failed:', error)
        }
    })
}

export const useLogout = () => {
    const queryClient = useQueryClient()
    const { clearAuth } = useStore()

    return useMutation<void, Error, void>({
        mutationFn: () => {
            // Clear auth token from store
            clearAuth()
            return Promise.resolve()
        },
        onSuccess: () => {
            // Clear all cached data on logout
            queryClient.invalidateQueries()
        }
    })
}