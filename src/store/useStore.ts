import { create } from 'zustand'
import type { RuleFilters } from '../types/api'

interface AppState {
    filters: RuleFilters
    setFilters: (filters: Partial<RuleFilters>) => void
    resetFilters: () => void
    selectedRules: number[]
    setSelectedRules: (ruleIds: number[]) => void
    toggleRuleSelection: (ruleId: number) => void
}

const defaultFilters: RuleFilters = {
    region: 'DEV',
    group: '1',
    search: '',
    enabled: 'all'
}

export const useStore = create<AppState>((set) => ({
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
        }))
}))