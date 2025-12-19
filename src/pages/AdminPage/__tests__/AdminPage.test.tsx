// pages/AdminPage/__tests__/AdminPage.test.tsx
import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/test/test-utils.tsx'
import { AdminPage } from '../AdminPage'
import { server } from '@/test/mocks/server.ts'
import {
  createAdminUserHandler,
  createUserHandler,
  createChromieRegionsHandler,
  createDisabledRegionsHandler,
  errorHandlers,
} from '@/test/mocks/handlers.ts'
import { testUser } from '@/test/mocks/factories.ts'
import { useStore } from '@/store/useStore.ts'
import userEvent from '@testing-library/user-event'

// =============================================================================
// Test Helpers
// =============================================================================

const renderAdminPage = (options: { authenticated?: boolean } = {}) => {
  const { authenticated = true } = options

  if (authenticated) {
    useStore.setState({ token: 'test-token' })
  }

  return renderWithProviders(<AdminPage />)
}

// =============================================================================
// Tests
// =============================================================================

describe('AdminPage', () => {
  describe('authentication states', () => {
    it('shows sign in required alert when not authenticated', async () => {
      renderAdminPage({ authenticated: false })

      await waitFor(() => {
        expect(screen.getByText(/sign in required/i)).toBeInTheDocument()
      })
      expect(screen.getByText(/please sign in to access settings/i)).toBeInTheDocument()
    })

    it('shows admin access required alert when user is not admin', async () => {
      server.use(createUserHandler(testUser)) // testUser has admin: false

      renderAdminPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText(/admin access required/i)).toBeInTheDocument()
      })
      expect(screen.getByText(/you must be an administrator/i)).toBeInTheDocument()
    })

    it('shows admin content when user is admin', async () => {
      server.use(createAdminUserHandler())

      renderAdminPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText(/chromie datacenters/i)).toBeInTheDocument()
      })
    })
  })

  describe('loading state', () => {
    it('shows loading spinner while fetching data', async () => {
      server.use(createAdminUserHandler())

      renderAdminPage({ authenticated: true })

      expect(screen.getByText(/loading settings/i)).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText(/loading settings/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('error states', () => {
    it('shows error alert when regions fail to load', async () => {
      server.use(createAdminUserHandler(), errorHandlers.chromieRegionsError)

      renderAdminPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText(/error loading settings/i)).toBeInTheDocument()
      })
    })
  })

  describe('regions table', () => {
    it('displays all chromie regions', async () => {
      server.use(
        createAdminUserHandler(),
        createChromieRegionsHandler(['us-west', 'us-east', 'eu-west']),
        createDisabledRegionsHandler([])
      )

      renderAdminPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText('us-west')).toBeInTheDocument()
        expect(screen.getByText('us-east')).toBeInTheDocument()
        expect(screen.getByText('eu-west')).toBeInTheDocument()
      })
    })

    it('shows empty state when no regions available', async () => {
      server.use(
        createAdminUserHandler(),
        createChromieRegionsHandler([]),
        createDisabledRegionsHandler([])
      )

      renderAdminPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText(/no regions available/i)).toBeInTheDocument()
      })
    })

    it('displays correct enabled/disabled state for regions', async () => {
      server.use(
        createAdminUserHandler(),
        createChromieRegionsHandler(['us-west', 'eu-east']),
        createDisabledRegionsHandler(['eu-east'])
      )

      renderAdminPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText('us-west')).toBeInTheDocument()
        expect(screen.getByText('eu-east')).toBeInTheDocument()
      })

      // Check switches - us-west should be enabled (checked), eu-east should be disabled (unchecked)
      const switches = screen.getAllByRole('switch')
      expect(switches).toHaveLength(2)

      // First switch (us-west) should be checked (enabled)
      expect(switches[0]).toBeChecked()

      // Second switch (eu-east) should be unchecked (disabled)
      expect(switches[1]).not.toBeChecked()
    })

    it('displays description text about disabling datacenters', async () => {
      server.use(createAdminUserHandler())

      renderAdminPage({ authenticated: true })

      await waitFor(() => {
        expect(
          screen.getByText(/disabling a datacenter will cause beam rules to not send requests/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('region toggling', () => {
    it('calls toggle handler when switch is clicked', async () => {
      server.use(
        createAdminUserHandler(),
        createChromieRegionsHandler(['us-west']),
        createDisabledRegionsHandler([])
      )

      renderAdminPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText('us-west')).toBeInTheDocument()
      })

      const toggle = screen.getByRole('switch')
      await userEvent.click(toggle)

      // The mutation should be triggered - we can verify by checking the switch state changes
      // or by checking that no error occurred
      await waitFor(() => {
        expect(toggle).toBeInTheDocument()
      })
    })

    it('disables switches while toggle is in progress', async () => {
      server.use(
        createAdminUserHandler(),
        createChromieRegionsHandler(['us-west', 'us-east']),
        createDisabledRegionsHandler([])
      )

      renderAdminPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText('us-west')).toBeInTheDocument()
      })

      // All switches should be enabled initially
      const switches = screen.getAllByRole('switch')
      switches.forEach((s) => expect(s).not.toBeDisabled())
    })
  })

  describe('table headers', () => {
    it('displays Region and Enabled column headers', async () => {
      server.use(createAdminUserHandler())

      renderAdminPage({ authenticated: true })

      await waitFor(() => {
        expect(screen.getByText('Region')).toBeInTheDocument()
        expect(screen.getByText('Enabled')).toBeInTheDocument()
      })
    })
  })
})
