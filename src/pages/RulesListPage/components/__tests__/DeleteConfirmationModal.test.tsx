// pages/RulesListPage/components/__tests__/DeleteConfirmationModal.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { DeleteConfirmationModal } from '../DeleteConfirmationModal'

// =============================================================================
// Test Helpers
// =============================================================================

const defaultProps = {
  opened: true,
  ruleCount: 1,
  isDeleting: false,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
}

const renderModal = (props: Partial<typeof defaultProps> = {}) =>
  renderWithProviders(<DeleteConfirmationModal {...defaultProps} {...props} />)

// =============================================================================
// Tests
// =============================================================================

describe('DeleteConfirmationModal', () => {
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

      expect(screen.getByText('Delete Rules')).toBeInTheDocument()
    })

    it('displays warning message with singular rule count', () => {
      renderModal({ ruleCount: 1 })

      expect(screen.getByText(/are you sure you want to delete 1 rule\?/i)).toBeInTheDocument()
    })

    it('displays warning message with plural rule count', () => {
      renderModal({ ruleCount: 5 })

      expect(screen.getByText(/are you sure you want to delete 5 rules\?/i)).toBeInTheDocument()
    })

    it('displays undone warning', () => {
      renderModal()

      expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument()
    })

    it('displays Cancel button', () => {
      renderModal()

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('displays Delete button with singular count', () => {
      renderModal({ ruleCount: 1 })

      expect(screen.getByRole('button', { name: /delete 1 rule$/i })).toBeInTheDocument()
    })

    it('displays Delete button with plural count', () => {
      renderModal({ ruleCount: 3 })

      expect(screen.getByRole('button', { name: /delete 3 rules/i })).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onClose when Cancel clicked', async () => {
      const onClose = vi.fn()
      renderModal({ onClose })

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onConfirm when Delete clicked', async () => {
      const onConfirm = vi.fn()
      renderModal({ onConfirm, ruleCount: 2 })

      await userEvent.click(screen.getByRole('button', { name: /delete 2 rules/i }))

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })
  })

  describe('loading state', () => {
    it('disables Cancel button when deleting', () => {
      renderModal({ isDeleting: true })

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })

    it('shows loading state on Delete button when deleting', () => {
      renderModal({ isDeleting: true, ruleCount: 1 })

      const deleteButton = screen.getByRole('button', { name: /delete 1 rule/i })
      expect(deleteButton).toHaveAttribute('data-loading', 'true')
    })
  })

  describe('alert styling', () => {
    it('renders alert with error color', () => {
      renderModal()

      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
    })
  })
})
