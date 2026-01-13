// pages/RulesListPage/components/__tests__/RuleHistoryModal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RuleHistoryModal } from '../RuleHistoryModal'
import { server } from '@/test/mocks/server'
import {
  createRuleHistoryHandler,
  createEmptyHistoryHandler,
  errorHandlers,
} from '@/test/mocks/handlers'
import { createTestRuleHistory, createRuleHistoryEntry } from '@/test/mocks/factories'
import type { RuleHistoryEntry } from '@/types/api'

// =============================================================================
// Test Helpers
// =============================================================================

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

const renderModal = (props: {
  opened?: boolean
  onClose?: () => void
  ruleName?: string
  ruleId?: number
  groupName?: string
}) => {
  const queryClient = createTestQueryClient()
  const {
    opened = true,
    onClose = vi.fn(),
    ruleName = 'Test Rule',
    ruleId = 152,
    groupName = 'Blizzard',
  } = props

  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <BrowserRouter>
          <RuleHistoryModal
            opened={opened}
            onClose={onClose}
            ruleName={ruleName}
            ruleId={ruleId}
            groupName={groupName}
          />
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  )
}

// =============================================================================
// Tests
// =============================================================================

describe('RuleHistoryModal', () => {
  beforeEach(() => {
    server.resetHandlers()
  })

  describe('rendering', () => {
    it('displays rule name in modal title', async () => {
      server.use(createRuleHistoryHandler(createTestRuleHistory(152)))
      renderModal({ ruleName: 'My Test Rule' })

      expect(screen.getByText('My Test Rule')).toBeInTheDocument()
    })

    it('displays group name', async () => {
      server.use(createRuleHistoryHandler(createTestRuleHistory(152)))
      renderModal({ groupName: 'Engineering Team' })

      expect(screen.getByText('Engineering Team')).toBeInTheDocument()
    })

    it('displays BEAM Group label', async () => {
      server.use(createRuleHistoryHandler(createTestRuleHistory(152)))
      renderModal({})

      expect(screen.getByText('BEAM Group')).toBeInTheDocument()
    })

    it('displays Rule History label', async () => {
      server.use(createRuleHistoryHandler(createTestRuleHistory(152)))
      renderModal({})

      expect(screen.getByText('Rule History')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows loading indicator while fetching', async () => {
      server.use(createRuleHistoryHandler(createTestRuleHistory(152)))
      renderModal({})

      expect(screen.getByText('Loading history...')).toBeInTheDocument()
    })

    it('hides loading indicator after data loads', async () => {
      server.use(createRuleHistoryHandler(createTestRuleHistory(152)))
      renderModal({})

      await waitFor(() => {
        expect(screen.queryByText('Loading history...')).not.toBeInTheDocument()
      })
    })
  })

  describe('history table', () => {
    it('displays table headers', async () => {
      server.use(createRuleHistoryHandler(createTestRuleHistory(152)))
      renderModal({})

      await waitFor(() => {
        expect(screen.getByText('Region')).toBeInTheDocument()
        expect(screen.getByText('Date')).toBeInTheDocument()
        expect(screen.getByText('User')).toBeInTheDocument()
        expect(screen.getByText('Action')).toBeInTheDocument()
        expect(screen.getByText('Version')).toBeInTheDocument()
      })
    })

    it('displays history entries', async () => {
      const history = createTestRuleHistory(152)
      server.use(createRuleHistoryHandler(history))
      renderModal({})

      await waitFor(() => {
        // Check for username from test data
        expect(screen.getByText('mmohiuddin')).toBeInTheDocument()
        // bechoi appears multiple times, so use getAllByText
        expect(screen.getAllByText('bechoi').length).toBeGreaterThan(0)
      })
    })

    it('displays action badges', async () => {
      const history: RuleHistoryEntry[] = [
        createRuleHistoryEntry({ action: 'update', username: 'user1', version: 2 }),
        createRuleHistoryEntry({ action: 'enable', username: 'user2' }),
        createRuleHistoryEntry({ action: 'disable', username: 'user3' }),
        createRuleHistoryEntry({ action: 'move', username: 'user4' }),
      ]
      server.use(createRuleHistoryHandler(history))
      renderModal({})

      await waitFor(() => {
        expect(screen.getByText('update')).toBeInTheDocument()
        expect(screen.getByText('enable')).toBeInTheDocument()
        expect(screen.getByText('disable')).toBeInTheDocument()
        expect(screen.getByText('move')).toBeInTheDocument()
      })
    })

    it('displays version number for update actions', async () => {
      const history: RuleHistoryEntry[] = [
        createRuleHistoryEntry({
          action: 'update',
          version: 5,
          date: '2024-01-01T12:00:00Z',
        }),
      ]
      server.use(createRuleHistoryHandler(history))
      renderModal({})

      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument()
      })
    })

    it('displays dash for entries without version', async () => {
      const history: RuleHistoryEntry[] = [
        createRuleHistoryEntry({
          action: 'move',
          version: null,
          date: '2024-01-01T12:00:00Z',
        }),
      ]
      server.use(createRuleHistoryHandler(history))
      renderModal({})

      await waitFor(() => {
        expect(screen.getByText('-')).toBeInTheDocument()
      })
    })

    it('displays region badge', async () => {
      const history: RuleHistoryEntry[] = [
        createRuleHistoryEntry({ region: 'DEV', date: '2024-01-01T12:00:00Z' }),
      ]
      server.use(createRuleHistoryHandler(history))
      renderModal({})

      await waitFor(() => {
        expect(screen.getByText('DEV')).toBeInTheDocument()
      })
    })

    it('filters out svcBEAM update actions', async () => {
      const history: RuleHistoryEntry[] = [
        createRuleHistoryEntry({
          action: 'update',
          username: 'svcBEAM',
          version: 10,
          date: '2024-01-02T12:00:00Z',
        }),
        createRuleHistoryEntry({
          action: 'update',
          username: 'regularUser',
          version: 9,
          date: '2024-01-01T12:00:00Z',
        }),
      ]
      server.use(createRuleHistoryHandler(history))
      renderModal({})

      await waitFor(() => {
        expect(screen.queryByText('svcBEAM')).not.toBeInTheDocument()
        expect(screen.getByText('regularUser')).toBeInTheDocument()
      })
    })
  })

  describe('View Changes link', () => {
    it('shows View Changes link for entries with version > 1', async () => {
      const history: RuleHistoryEntry[] = [
        createRuleHistoryEntry({
          action: 'update',
          version: 3,
          date: '2024-01-01T12:00:00Z',
        }),
      ]
      server.use(createRuleHistoryHandler(history))
      renderModal({ ruleId: 100 })

      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'View Changes' })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/rules/100?version=3&compare=2')
      })
    })

    it('does not show View Changes link for version 1', async () => {
      const history: RuleHistoryEntry[] = [
        createRuleHistoryEntry({
          action: 'create',
          version: 1,
          date: '2024-01-01T12:00:00Z',
        }),
      ]
      server.use(createRuleHistoryHandler(history))
      renderModal({})

      await waitFor(() => {
        expect(screen.queryByRole('link', { name: 'View Changes' })).not.toBeInTheDocument()
      })
    })
  })

  describe('Load link', () => {
    it('shows Load link for entries with version', async () => {
      const history: RuleHistoryEntry[] = [
        createRuleHistoryEntry({
          action: 'update',
          version: 2,
          date: '2024-01-01T12:00:00Z',
        }),
      ]
      server.use(createRuleHistoryHandler(history))
      renderModal({ ruleId: 100 })

      await waitFor(() => {
        const link = screen.getByRole('link', { name: 'Load' })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/rules/100?version=2')
      })
    })

    it('does not show Load link for entries without version', async () => {
      const history: RuleHistoryEntry[] = [
        createRuleHistoryEntry({
          action: 'move',
          version: null,
          date: '2024-01-01T12:00:00Z',
        }),
      ]
      server.use(createRuleHistoryHandler(history))
      renderModal({})

      await waitFor(() => {
        expect(screen.queryByRole('link', { name: 'Load' })).not.toBeInTheDocument()
      })
    })
  })

  describe('empty state', () => {
    it('displays empty message when no history exists', async () => {
      server.use(createEmptyHistoryHandler())
      renderModal({})

      await waitFor(() => {
        expect(screen.getByText('No history found for this rule.')).toBeInTheDocument()
      })
    })
  })

  describe('error state', () => {
    it('displays error message when API fails', async () => {
      server.use(errorHandlers.ruleHistoryError)
      renderModal({})

      await waitFor(() => {
        expect(screen.getByText(/Failed to load history/)).toBeInTheDocument()
      })
    })
  })

  describe('modal behavior', () => {
    it('calls onClose when clicking close button', async () => {
      const onClose = vi.fn()
      server.use(createRuleHistoryHandler(createTestRuleHistory(152)))
      renderModal({ onClose })

      await waitFor(() => {
        expect(screen.queryByText('Loading history...')).not.toBeInTheDocument()
      })

      // The Mantine Modal close button - find by aria-label
      const closeButtons = screen.getAllByRole('button')
      // The close button is typically the first button in the modal header
      const closeButton = closeButtons[0]
      await userEvent.click(closeButton)

      expect(onClose).toHaveBeenCalled()
    })

    it('does not render when opened is false', () => {
      renderModal({ opened: false })

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders when opened is true', async () => {
      server.use(createRuleHistoryHandler(createTestRuleHistory(152)))
      renderModal({ opened: true })

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('date formatting', () => {
    it('formats dates correctly', async () => {
      const history: RuleHistoryEntry[] = [
        createRuleHistoryEntry({
          date: '2024-06-15T14:30:00.000Z',
        }),
      ]
      server.use(createRuleHistoryHandler(history))
      renderModal({})

      await waitFor(() => {
        // Check for date components - format varies by locale
        expect(screen.getByText(/6\/15\/2024|15\/6\/2024/)).toBeInTheDocument()
      })
    })
  })
})
