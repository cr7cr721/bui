// pages/RulesListPage/components/__tests__/MoveToGroupModal.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { MoveToGroupModal } from '../MoveToGroupModal'
import { createGroup } from '@/test/mocks/factories'

// =============================================================================
// Test Helpers
// =============================================================================

const testGroups = [
  createGroup({ id: 1, fullname: 'Engineering' }),
  createGroup({ id: 2, fullname: 'QA Team' }),
  createGroup({ id: 3, fullname: 'DevOps' }),
]

const defaultProps = {
  opened: true,
  ruleCount: 1,
  groups: testGroups,
  selectedGroup: null as string | null,
  isMoving: false,
  onClose: vi.fn(),
  onGroupChange: vi.fn(),
  onConfirm: vi.fn(),
}

const renderModal = (props: Partial<typeof defaultProps> = {}) =>
  renderWithProviders(<MoveToGroupModal {...defaultProps} {...props} />)

const openGroupDropdown = async () => {
  const select = screen.getByPlaceholderText('Select group')
  await userEvent.click(select)
  await waitFor(() => {
    expect(screen.getByText('Engineering')).toBeInTheDocument()
  })
  return select
}

// =============================================================================
// Tests
// =============================================================================

describe('MoveToGroupModal', () => {
  describe('visibility', () => {
    it('renders when opened is true', () => {
      renderModal({ opened: true })

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('does not render when opened is false', () => {
      renderModal({ opened: false })

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('content', () => {
    it('displays modal title', () => {
      renderModal()

      expect(screen.getByText('Move Rules to Group')).toBeInTheDocument()
    })

    it('displays description with singular rule count', () => {
      renderModal({ ruleCount: 1 })

      expect(screen.getByText(/move 1 rule to a different group/i)).toBeInTheDocument()
    })

    it('displays description with plural rule count', () => {
      renderModal({ ruleCount: 5 })

      expect(screen.getByText(/move 5 rules to a different group/i)).toBeInTheDocument()
    })

    it('displays Target Group label', () => {
      renderModal()

      expect(screen.getByText('Target Group')).toBeInTheDocument()
    })

    it('displays group select with placeholder', () => {
      renderModal()

      expect(screen.getByPlaceholderText('Select group')).toBeInTheDocument()
    })

    it('displays Cancel button', () => {
      renderModal()

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('displays Move Rules button', () => {
      renderModal()

      expect(screen.getByRole('button', { name: /move rules/i })).toBeInTheDocument()
    })
  })

  describe('group selection', () => {
    it('opens dropdown when select clicked', async () => {
      renderModal()

      await openGroupDropdown()

      expect(screen.getByText('QA Team')).toBeInTheDocument()
      expect(screen.getByText('DevOps')).toBeInTheDocument()
    })

    it('calls onGroupChange when group selected', async () => {
      const onGroupChange = vi.fn()
      renderModal({ onGroupChange })

      await openGroupDropdown()
      await userEvent.click(screen.getByText('Engineering'))

      expect(onGroupChange).toHaveBeenCalled()
      expect(onGroupChange.mock.calls[0][0]).toBe('1')
    })

    it('shows empty state when no groups available', async () => {
      renderModal({ groups: [] })

      const select = screen.getByPlaceholderText('Select group')
      await userEvent.click(select)

      await waitFor(() => {
        expect(screen.getByText('No groups found')).toBeInTheDocument()
      })
    })
  })

  describe('button states', () => {
    it('disables Move Rules button when no group selected', () => {
      renderModal({ selectedGroup: null })

      expect(screen.getByRole('button', { name: /move rules/i })).toBeDisabled()
    })

    it('enables Move Rules button when group selected', () => {
      renderModal({ selectedGroup: '1' })

      expect(screen.getByRole('button', { name: /move rules/i })).not.toBeDisabled()
    })
  })

  describe('interactions', () => {
    it('calls onClose when Cancel clicked', async () => {
      const onClose = vi.fn()
      renderModal({ onClose })

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onConfirm when Move Rules clicked', async () => {
      const onConfirm = vi.fn()
      renderModal({ selectedGroup: '1', onConfirm })

      await userEvent.click(screen.getByRole('button', { name: /move rules/i }))

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('does not call onConfirm when no group selected', async () => {
      const onConfirm = vi.fn()
      renderModal({ selectedGroup: null, onConfirm })

      const moveButton = screen.getByRole('button', { name: /move rules/i })
      await userEvent.click(moveButton)

      expect(onConfirm).not.toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('disables Cancel button when moving', () => {
      renderModal({ isMoving: true })

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })

    it('shows loading state on Move Rules button when moving', () => {
      renderModal({ isMoving: true, selectedGroup: '1' })

      const moveButton = screen.getByRole('button', { name: /move rules/i })
      expect(moveButton).toHaveAttribute('data-loading', 'true')
    })

    it('disables group select when moving', () => {
      renderModal({ isMoving: true })

      const select = screen.getByPlaceholderText('Select group')
      expect(select).toBeDisabled()
    })
  })
})
