// pages/GroupsPage/components/__tests__/CreateGroupModal.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/test/test-utils'
import { CreateGroupModal } from '../CreateGroupModal'
import userEvent from '@testing-library/user-event'

// =============================================================================
// Test Helpers
// =============================================================================

const defaultProps = {
  opened: true,
  isCreating: false,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
}

const renderModal = (props: Partial<typeof defaultProps> = {}) =>
  renderWithProviders(<CreateGroupModal {...defaultProps} {...props} />)

// =============================================================================
// Tests
// =============================================================================

describe('CreateGroupModal', () => {
  describe('rendering', () => {
    it('renders modal with correct title', () => {
      renderModal()

      expect(screen.getByRole('heading', { name: 'Create Group' })).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      renderModal()

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/cn ldap group/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/public group/i)).toBeInTheDocument()
    })

    it('renders Cancel and Create Group buttons', () => {
      renderModal()

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create group/i })).toBeInTheDocument()
    })

    it('does not render when opened is false', () => {
      renderModal({ opened: false })

      expect(screen.queryByRole('heading', { name: 'Create Group' })).not.toBeInTheDocument()
    })

    it('has public group switch checked by default', () => {
      renderModal()

      const publicSwitch = screen.getByRole('switch', { name: /public group/i })
      expect(publicSwitch).toBeChecked()
    })
  })

  describe('form validation', () => {
    it('does not call onSubmit when submitting without full name', async () => {
      const onSubmit = vi.fn()
      renderModal({ onSubmit })

      const submitButton = screen.getByRole('button', { name: /create group/i })
      await userEvent.click(submitButton)

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('does not show error for empty LDAP group (optional field)', async () => {
      const onSubmit = vi.fn()
      renderModal({ onSubmit })

      const fullnameInput = screen.getByLabelText(/full name/i)
      await userEvent.type(fullnameInput, 'Test Group')

      const submitButton = screen.getByRole('button', { name: /create group/i })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('form submission', () => {
    it('calls onSubmit with correct data when form is valid', async () => {
      const onSubmit = vi.fn()
      renderModal({ onSubmit })

      await userEvent.type(screen.getByLabelText(/full name/i), 'New Team')
      await userEvent.type(screen.getByLabelText(/cn ldap group/i), 'AD-NEW-TEAM')

      const submitButton = screen.getByRole('button', { name: /create group/i })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          fullname: 'New Team',
          ad_group: 'AD-NEW-TEAM',
          public: true,
        })
      })
    })

    it('submits with public: false when switch is toggled off', async () => {
      const onSubmit = vi.fn()
      renderModal({ onSubmit })

      await userEvent.type(screen.getByLabelText(/full name/i), 'Private Team')

      const publicSwitch = screen.getByRole('switch', { name: /public group/i })
      await userEvent.click(publicSwitch)

      const submitButton = screen.getByRole('button', { name: /create group/i })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          fullname: 'Private Team',
          ad_group: '',
          public: false,
        })
      })
    })

    it('resets form after successful submission', async () => {
      const onSubmit = vi.fn()
      renderModal({ onSubmit })

      const fullnameInput = screen.getByLabelText(/full name/i)
      await userEvent.type(fullnameInput, 'Test Group')

      const submitButton = screen.getByRole('button', { name: /create group/i })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })

      expect(fullnameInput).toHaveValue('')
    })
  })

  describe('cancel behavior', () => {
    it('calls onClose when Cancel button is clicked', async () => {
      const onClose = vi.fn()
      renderModal({ onClose })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await userEvent.click(cancelButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('resets form when Cancel is clicked', async () => {
      const onClose = vi.fn()
      renderModal({ onClose })

      const fullnameInput = screen.getByLabelText(/full name/i)
      await userEvent.type(fullnameInput, 'Some Text')

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await userEvent.click(cancelButton)

      expect(fullnameInput).toHaveValue('')
    })
  })

  describe('loading state', () => {
    it('disables all inputs when isCreating is true', () => {
      renderModal({ isCreating: true })

      expect(screen.getByLabelText(/full name/i)).toBeDisabled()
      expect(screen.getByLabelText(/cn ldap group/i)).toBeDisabled()
      expect(screen.getByRole('switch', { name: /public group/i })).toBeDisabled()
    })

    it('disables Cancel button when isCreating is true', () => {
      renderModal({ isCreating: true })

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })

    it('shows loading state on Create Group button when isCreating is true', () => {
      renderModal({ isCreating: true })

      const submitButton = screen.getByRole('button', { name: /create group/i })
      expect(submitButton).toHaveAttribute('data-loading', 'true')
    })
  })
})
