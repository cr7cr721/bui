// pages/GroupsPage/__tests__/GroupsPage.test.tsx
import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/test/test-utils'
import { GroupsPage } from '../GroupsPage'
import { server } from '@/test/mocks/server'
import {
  createUserHandler,
  createAdminUserHandler,
  createUserWithGroupsHandler,
  createAdminWithGroupsHandler,
  errorHandlers,
} from '@/test/mocks/handlers'
import { testUser, createGroup } from '@/test/mocks/factories'
import { useStore } from '@/store/useStore'
import userEvent from '@testing-library/user-event'

// =============================================================================
// Test Helpers
// =============================================================================

const renderGroupsPage = (options: { authenticated?: boolean } = {}) => {
  const { authenticated = true } = options

  if (authenticated) {
    useStore.setState({ token: 'test-token' })
  } else {
    useStore.setState({ token: null })
  }

  return renderWithProviders(<GroupsPage />)
}

// =============================================================================
// Tests
// =============================================================================

describe('GroupsPage', () => {
  describe('loading state', () => {
    it('shows loading spinner while fetching data', async () => {
      server.use(createUserHandler(testUser))

      renderGroupsPage({ authenticated: true })

      expect(screen.getByText(/loading groups/i)).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText(/loading groups/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('error states', () => {
    it('shows error alert when user data fails to load', async () => {
      server.use(errorHandlers.userError)

      renderGroupsPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText(/error loading groups/i)).toBeInTheDocument()
      })
    })
  })

  describe('groups display', () => {
    it('displays groups table with user groups', async () => {
      const groups = [
        createGroup({ id: 1, fullname: 'Engineering', ad_group: 'AD-ENG' }),
        createGroup({ id: 2, fullname: 'QA Team', ad_group: 'AD-QA' }),
      ]
      server.use(createUserWithGroupsHandler(groups))

      renderGroupsPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument()
        expect(screen.getByText('QA Team')).toBeInTheDocument()
      })
    })

    it('displays correct group count in title', async () => {
      const groups = [createGroup({ id: 1 }), createGroup({ id: 2 }), createGroup({ id: 3 })]
      server.use(createUserWithGroupsHandler(groups))

      renderGroupsPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText('Groups (3)')).toBeInTheDocument()
      })
    })

    it('shows empty state when user has no groups', async () => {
      server.use(createUserWithGroupsHandler([]))

      renderGroupsPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText('Groups (0)')).toBeInTheDocument()
      })
    })
  })

  describe('admin functionality', () => {
    it('shows Create Group button for admin users', async () => {
      server.use(createAdminUserHandler())

      renderGroupsPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create group/i })).toBeInTheDocument()
      })
    })

    it('hides Create Group button for non-admin users', async () => {
      server.use(createUserHandler(testUser))

      renderGroupsPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText(/groups/i)).toBeInTheDocument()
      })

      expect(screen.queryByRole('button', { name: /create group/i })).not.toBeInTheDocument()
    })

    it('shows Edit Group buttons for admin users', async () => {
      const groups = [createGroup({ id: 1, fullname: 'Test Group' })]
      server.use(createAdminWithGroupsHandler(groups))

      renderGroupsPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit group/i })).toBeInTheDocument()
      })
    })

    it('hides Edit Group buttons for non-admin users', async () => {
      const groups = [createGroup({ id: 1, fullname: 'Test Group' })]
      server.use(createUserWithGroupsHandler(groups))

      renderGroupsPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText('Test Group')).toBeInTheDocument()
      })

      expect(screen.queryByRole('button', { name: /edit group/i })).not.toBeInTheDocument()
    })
  })

  describe('create group modal', () => {
    it('opens create modal when Create Group button is clicked', async () => {
      server.use(createAdminUserHandler())

      renderGroupsPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create group/i })).toBeInTheDocument()
      })

      const createButton = screen.getByRole('button', { name: /create group/i })
      await userEvent.click(createButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })
    })

    it('closes create modal when Cancel is clicked', async () => {
      server.use(createAdminUserHandler())

      renderGroupsPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create group/i })).toBeInTheDocument()
      })

      // Open modal
      await userEvent.click(screen.getByRole('button', { name: /create group/i }))

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })

      // Close modal
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await userEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByLabelText(/full name/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('edit group modal', () => {
    it('opens edit modal when Edit Group button is clicked', async () => {
      const groups = [createGroup({ id: 1, fullname: 'Editable Group', ad_group: 'AD-EDIT' })]
      server.use(createAdminWithGroupsHandler(groups))

      renderGroupsPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit group/i })).toBeInTheDocument()
      })

      await userEvent.click(screen.getByRole('button', { name: /edit group/i }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByLabelText(/full name/i)).toHaveValue('Editable Group')
      })
    })

    it('closes edit modal when Cancel is clicked', async () => {
      const groups = [createGroup({ id: 1, fullname: 'Test Group' })]
      server.use(createAdminWithGroupsHandler(groups))

      renderGroupsPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit group/i })).toBeInTheDocument()
      })

      // Open modal
      await userEvent.click(screen.getByRole('button', { name: /edit group/i }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Close modal - get cancel button within the dialog
      const dialog = screen.getByRole('dialog')
      const cancelButton = dialog.querySelector('button[type="button"]:not([class*="Close"])')
      if (cancelButton) {
        await userEvent.click(cancelButton)
      }

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('table content', () => {
    it('displays column headers', async () => {
      server.use(createUserHandler(testUser))

      renderGroupsPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText('Full name')).toBeInTheDocument()
        expect(screen.getByText('CN LDAP group')).toBeInTheDocument()
        expect(screen.getByText('Access')).toBeInTheDocument()
      })
    })

    it('displays Save Rules badge for groups with write access', async () => {
      const groups = [
        createGroup({ id: 1, fullname: 'Writers', write: true }),
        createGroup({ id: 2, fullname: 'Readers', write: false }),
      ]
      server.use(createUserWithGroupsHandler(groups))

      renderGroupsPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText('Writers')).toBeInTheDocument()
      })

      const badges = screen.getAllByText('Save Rules')
      expect(badges).toHaveLength(1)
    })
  })
})
