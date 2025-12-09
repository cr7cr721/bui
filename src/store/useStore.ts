// store/useStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setAuthHelpers } from '@/services'
import type { RuleFilters } from '@/types/api'

interface AppState {
  // Filters state
  filters: RuleFilters
  setFilters: (filters: Partial<RuleFilters>) => void
  resetFilters: () => void

  // Selection state
  selectedRules: number[]
  setSelectedRules: (ruleIds: number[]) => void
  toggleRuleSelection: (ruleId: number) => void
  clearSelection: () => void

  // Auth state
  token: string | null
  isSignInModalOpen: boolean
  setToken: (token: string | null) => void
  setSignInModalOpen: (open: boolean) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

const defaultFilters: RuleFilters = {
  region: 'DEV',
  group: '1',
  search: '',
  enabled: 'all',
  author: '',
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Filters state
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),

      // Selection state
      selectedRules: [],
      setSelectedRules: (ruleIds) => set({ selectedRules: ruleIds }),
      toggleRuleSelection: (ruleId) =>
        set((state) => ({
          selectedRules: state.selectedRules.includes(ruleId)
            ? state.selectedRules.filter((id) => id !== ruleId)
            : [...state.selectedRules, ruleId],
        })),
      clearSelection: () => set({ selectedRules: [] }),

      // Auth state
      token: null,
      isSignInModalOpen: false,
      setToken: (token) => set({ token }),
      setSignInModalOpen: (open) => set({ isSignInModalOpen: open }),
      clearAuth: () =>
        set({
          token: null,
          selectedRules: [], // Clear selection on logout
        }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'beam-dashboard-storage',
      partialize: (state) => ({
        token: state.token,
        filters: state.filters,
      }),
    }
  )
)

// Initialize auth helpers for the HTTP client
setAuthHelpers(
  () => useStore.getState().token,
  () => useStore.getState().clearAuth()
)
