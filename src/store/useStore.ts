import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RuleFilters } from '@/types/api'

interface AppState {
    // Existing state
    filters: RuleFilters
    setFilters: (filters: Partial<RuleFilters>) => void
    resetFilters: () => void
    selectedRules: number[]
    setSelectedRules: (ruleIds: number[]) => void
    toggleRuleSelection: (ruleId: number) => void

    // Auth state
    authToken: string | null
    isSignInModalOpen: boolean
    setAuthToken: (token: string | null) => void
    setSignInModalOpen: (open: boolean) => void
    clearAuth: () => void
    isAuthenticated: () => boolean
}

const defaultFilters: RuleFilters = {
    region: 'DEV',
    group: '1',
    search: '',
    enabled: 'all'
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Existing state
            filters: defaultFilters,
            setFilters: (newFilters) =>
                set((state) => ({
                    filters: { ...state.filters, ...newFilters }
                })),
            resetFilters: () => set({ filters: defaultFilters }),
            selectedRules: [],
            setSelectedRules: (ruleIds) => set({ selectedRules: ruleIds }),
            toggleRuleSelection: (ruleId) =>
                set((state) => ({
                    selectedRules: state.selectedRules.includes(ruleId)
                        ? state.selectedRules.filter(id => id !== ruleId)
                        : [...state.selectedRules, ruleId]
                })),

            // Auth state
            authToken: null,
            isSignInModalOpen: false,
            setAuthToken: (token) => set({ authToken: token }),
            setSignInModalOpen: (open) => set({ isSignInModalOpen: open }),
            clearAuth: () => set({ authToken: null }),
            isAuthenticated: () => !!get().authToken
        }),
        {
            name: 'beam-dashboard-storage',
            // Only persist auth token and filters, not UI state
            partialize: (state) => ({
                authToken: state.authToken,
                filters: state.filters
            })
        }
    )
)