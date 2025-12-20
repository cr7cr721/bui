// pages/GroupsPage/components/__tests__/EditGroupModal.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/test/test-utils'
import { EditGroupModal, type EditGroupModalProps } from '../EditGroupModal'
import userEvent from '@testing-library/user-event'
import type { Group } from '@/types/api'

// =============================================================================
// Test Helpers
// =============================================================================

const createTestGroup = (overrides: Partial<Group> = {}): Group => ({
  id: 1,
  fullname: 'Test Group',
  ad_group: 'AD-TEST',
  write: false,
  public: true,
  ...overrides,
})

const defaultProps: EditGroupModalProps = {
  opened: true,
  group: createTestGroup(),
  isUpdating: false,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
}

const renderModal = (props: Partial<typeof defaultProps> = {}) =>
  renderWithProviders(<EditGroupModal {...defaultProps} {...props} />)

// =============================================================================
// Tests
// =============================================================================

describe('EditGroupModal', () => {
  describe('rendering', () => {
    it('renders modal with correct title', () => {
      renderModal()

      expect(screen.getByRole('heading', { name: 'Edit Group' })).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      renderModal()

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/cn ldap group/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/public group/i)).toBeInTheDocument()
    })

    it('renders Cancel and Update Group buttons', () => {
      renderModal()

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /update group/i })).toBeInTheDocument()
    })

    it('does not render when opened is false', () => {
      renderModal({ opened: false })

      expect(screen.queryByRole('heading', { name: 'Edit Group' })).not.toBeInTheDocument()
    })
  })

  describe('pre-populated data', () => {
    it('populates form with group data', () => {
      const group = createTestGroup({
        fullname: 'Engineering Team',
        ad_group: 'AD-ENG',
        public: true,
      })
      renderModal({ group })

      expect(screen.getByLabelText(/full name/i)).toHaveValue('Engineering Team')
      expect(screen.getByLabelText(/cn ldap group/i)).toHaveValue('AD-ENG')
      expect(screen.getByRole('switch', { name: /public group/i })).toBeChecked()
    })

    it('shows unchecked public switch for private groups', () => {
      const group = createTestGroup({ public: false })
      renderModal({ group })

      expect(screen.getByRole('switch', { name: /public group/i })).not.toBeChecked()
    })

    it('handles empty ad_group value', () => {
      const group = createTestGroup({ ad_group: '' })
      renderModal({ group })

      expect(screen.getByLabelText(/cn ldap group/i)).toHaveValue('')
    })

    it('handles null ad_group value', () => {
      const group = createTestGroup({ ad_group: null as unknown as string })
      renderModal({ group })

      expect(screen.getByLabelText(/cn ldap group/i)).toHaveValue('')
    })
  })

  describe('form validation', () => {
    it('does not call onSubmit when full name is cleared and submitted', async () => {
      const onSubmit = vi.fn()
      renderModal({ onSubmit })

      const fullnameInput = screen.getByLabelText(/full name/i)
      await userEvent.clear(fullnameInput)

      const submitButton = screen.getByRole('button', { name: /update group/i })
      await userEvent.click(submitButton)

      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('form submission', () => {
    it('calls onSubmit with groupId and updated data', async () => {
      const onSubmit = vi.fn()
      const group = createTestGroup({ id: 42, fullname: 'Original Name' })
      renderModal({ group, onSubmit })

      const fullnameInput = screen.getByLabelText(/full name/i)
      await userEvent.clear(fullnameInput)
      await userEvent.type(fullnameInput, 'Updated Name')

      const submitButton = screen.getByRole('button', { name: /update group/i })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(42, {
          fullname: 'Updated Name',
          ad_group: 'AD-TEST',
          public: true,
        })
      })
    })

    it('submits toggled public state correctly', async () => {
      const onSubmit = vi.fn()
      const group = createTestGroup({ id: 1, public: true })
      renderModal({ group, onSubmit })

      const publicSwitch = screen.getByRole('switch', { name: /public group/i })
      await userEvent.click(publicSwitch)

      const submitButton = screen.getByRole('button', { name: /update group/i })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            public: false,
          })
        )
      })
    })

    it('submits updated ad_group correctly', async () => {
      const onSubmit = vi.fn()
      const group = createTestGroup({ id: 1 })
      renderModal({ group, onSubmit })

      const adGroupInput = screen.getByLabelText(/cn ldap group/i)
      await userEvent.clear(adGroupInput)
      await userEvent.type(adGroupInput, 'AD-NEW-GROUP')

      const submitButton = screen.getByRole('button', { name: /update group/i })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            ad_group: 'AD-NEW-GROUP',
          })
        )
      })
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

    it('resets form to initial values when Cancel is clicked', async () => {
      const onClose = vi.fn()
      const group = createTestGroup({ fullname: 'Original Name' })
      renderModal({ group, onClose })

      const fullnameInput = screen.getByLabelText(/full name/i)
      await userEvent.clear(fullnameInput)
      await userEvent.type(fullnameInput, 'Changed Name')

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await userEvent.click(cancelButton)

      // After reset, should show empty (reset to initial empty values)
      expect(fullnameInput).toHaveValue('')
    })
  })

  describe('loading state', () => {
    it('disables all inputs when isUpdating is true', () => {
      renderModal({ isUpdating: true })

      expect(screen.getByLabelText(/full name/i)).toBeDisabled()
      expect(screen.getByLabelText(/cn ldap group/i)).toBeDisabled()
      expect(screen.getByRole('switch', { name: /public group/i })).toBeDisabled()
    })

    it('disables Cancel button when isUpdating is true', () => {
      renderModal({ isUpdating: true })

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })

    it('shows loading state on Update Group button when isUpdating is true', () => {
      renderModal({ isUpdating: true })

      const submitButton = screen.getByRole('button', { name: /update group/i })
      expect(submitButton).toHaveAttribute('data-loading', 'true')
    })
  })

  describe('null group handling', () => {
    it('handles null group gracefully', () => {
      renderModal({ group: null })

      // Should render with empty values
      expect(screen.getByLabelText(/full name/i)).toHaveValue('')
      expect(screen.getByLabelText(/cn ldap group/i)).toHaveValue('')
    })
  })
})
