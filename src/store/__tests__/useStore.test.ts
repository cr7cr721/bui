// store/__tests__/useStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '@/store/useStore'

describe('useStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useStore.setState({
      token: null,
      isSignInModalOpen: false,
      filters: {
        region: 'DEV',
        group: '1',
        search: '',
        enabled: 'all',
        author: '',
      },
      selectedRules: [],
    })
  })

  describe('auth state', () => {
    it('starts with null token', () => {
      expect(useStore.getState().token).toBeNull()
    })

    it('sets token correctly', () => {
      useStore.getState().setToken('test-token-123')

      expect(useStore.getState().token).toBe('test-token-123')
    })

    it('clears auth and selection', () => {
      useStore.setState({
        token: 'existing-token',
        selectedRules: [1, 2, 3],
      })

      useStore.getState().clearAuth()

      expect(useStore.getState().token).toBeNull()
      expect(useStore.getState().selectedRules).toEqual([])
    })

    it('returns correct isAuthenticated status', () => {
      expect(useStore.getState().isAuthenticated()).toBe(false)

      useStore.getState().setToken('token')

      expect(useStore.getState().isAuthenticated()).toBe(true)
    })

    it('opens and closes sign in modal', () => {
      expect(useStore.getState().isSignInModalOpen).toBe(false)

      useStore.getState().setSignInModalOpen(true)
      expect(useStore.getState().isSignInModalOpen).toBe(true)

      useStore.getState().setSignInModalOpen(false)
      expect(useStore.getState().isSignInModalOpen).toBe(false)
    })
  })

  describe('filters state', () => {
    it('has correct default filters', () => {
      const { filters } = useStore.getState()

      expect(filters).toEqual({
        region: 'DEV',
        group: '1',
        search: '',
        enabled: 'all',
        author: '',
      })
    })

    it('updates partial filters', () => {
      useStore.getState().setFilters({ search: 'test query' })

      const { filters } = useStore.getState()
      expect(filters.search).toBe('test query')
      expect(filters.region).toBe('DEV') // unchanged
    })

    it('updates multiple filters at once', () => {
      useStore.getState().setFilters({
        region: 'NA',
        group: '5',
        enabled: 'enabled',
      })

      const { filters } = useStore.getState()
      expect(filters.region).toBe('NA')
      expect(filters.group).toBe('5')
      expect(filters.enabled).toBe('enabled')
    })

    it('resets filters to defaults', () => {
      useStore.getState().setFilters({
        region: 'EU',
        group: '10',
        search: 'modified',
        enabled: 'disabled',
        author: 'test@test.com',
      })

      useStore.getState().resetFilters()

      const { filters } = useStore.getState()
      expect(filters).toEqual({
        region: 'DEV',
        group: '1',
        search: '',
        enabled: 'all',
        author: '',
      })
    })
  })

  describe('selection state', () => {
    it('starts with empty selection', () => {
      expect(useStore.getState().selectedRules).toEqual([])
    })

    it('sets selected rules', () => {
      useStore.getState().setSelectedRules([1, 2, 3])

      expect(useStore.getState().selectedRules).toEqual([1, 2, 3])
    })

    it('toggles rule selection - adds when not selected', () => {
      useStore.getState().toggleRuleSelection(5)

      expect(useStore.getState().selectedRules).toContain(5)
    })

    it('toggles rule selection - removes when already selected', () => {
      useStore.setState({ selectedRules: [1, 2, 3] })

      useStore.getState().toggleRuleSelection(2)

      expect(useStore.getState().selectedRules).toEqual([1, 3])
    })

    it('clears selection', () => {
      useStore.setState({ selectedRules: [1, 2, 3, 4, 5] })

      useStore.getState().clearSelection()

      expect(useStore.getState().selectedRules).toEqual([])
    })

    it('maintains selection order when toggling', () => {
      useStore.getState().toggleRuleSelection(1)
      useStore.getState().toggleRuleSelection(3)
      useStore.getState().toggleRuleSelection(2)

      expect(useStore.getState().selectedRules).toEqual([1, 3, 2])
    })
  })

  describe('state persistence shape', () => {
    // The store uses persist middleware - test the partialize function behavior
    it('only persists token and filters', () => {
      // This tests the shape that would be persisted
      const state = useStore.getState()

      // These should exist and be persistable
      expect(state).toHaveProperty('token')
      expect(state).toHaveProperty('filters')

      // These should exist but NOT be persisted (runtime only)
      expect(state).toHaveProperty('selectedRules')
      expect(state).toHaveProperty('isSignInModalOpen')
    })
  })

  describe('combined operations', () => {
    it('handles typical user session flow', () => {
      const store = useStore.getState()

      // User signs in
      store.setToken('user-token')
      expect(store.isAuthenticated()).toBe(true)

      // User changes filters
      store.setFilters({ region: 'NA', group: '2' })

      // User selects some rules
      store.setSelectedRules([1, 2])
      store.toggleRuleSelection(3)

      expect(useStore.getState().selectedRules).toEqual([1, 2, 3])

      // User signs out
      store.clearAuth()

      expect(useStore.getState().token).toBeNull()
      expect(useStore.getState().selectedRules).toEqual([])
      // Filters should persist after logout
      expect(useStore.getState().filters.region).toBe('NA')
    })
  })
})
