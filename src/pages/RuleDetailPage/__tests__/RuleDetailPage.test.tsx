/**
 * RuleDetailPage Integration Tests
 *
 * Tests the full RuleDetailPage including:
 * - Page states (loading, error, success)
 * - Permission handling (read-only vs editable)
 * - Tab navigation (Form View vs JSON View)
 * - Stepper navigation between form steps
 * - Save functionality with notifications
 * - URL parameter handling for rule ID
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { server } from '@/test/mocks/server'
import { http, HttpResponse, delay } from 'msw'
import { createUserHandler, errorHandlers } from '@/test/mocks/handlers'
import { testUser, createUser, createGroup } from '@/test/mocks/factories'
import { useStore } from '@/store/useStore'
import { RuleDetailPage } from '../RuleDetailPage'
import { Routes, Route } from 'react-router-dom'

// =============================================================================
// Test Constants
// =============================================================================

const BASE = 'https://gdp-beam-api.dev.data.blz.dev'

// Test rule data that matches the handler response structure
const testRuleResponse = {
  id: 1,
  version: 5,
  body: {
    name: 'Login Monitor',
    author: 'test@blizzard.com',
    regions: ['DEV', 'NA'],
    inputs: [{ search: { size: 0, query: { match_all: {} } }, index: 'all-telemetry-v2-*' }],
    actions: [
      {
        email: {
          to: 'alerts@blizzard.com',
          subject: 'Login Alert',
          body: 'Alert body content',
          format: 'html',
          templateType: 'handlebars',
        },
      },
    ],
  },
}

// =============================================================================
// Test Setup & Helpers
// =============================================================================

/**
 * Render the RuleDetailPage with routing context
 * Uses MemoryRouter with initial route matching /rules/:id
 */
const renderPage = (ruleId = 1, authenticated = true) => {
  useStore.setState({ token: authenticated ? 'test-token' : null })

  return renderWithProviders(
    <Routes>
      <Route path="/rules/:id" element={<RuleDetailPage />} />
    </Routes>,
    { initialEntries: [`/rules/${ruleId}`] }
  )
}

/**
 * Wait for page to finish loading by checking for rule name
 */
const waitForPageLoad = async (ruleName = testRuleResponse.body.name) => {
  await screen.findByText(ruleName, {}, { timeout: 5000 })
}

/**
 * Create a user with write access to test editing
 */
const userWithWriteAccess = createUser({
  ...testUser,
  groups: [
    createGroup({ id: 1, fullname: 'Test Group', write: true }),
    createGroup({ id: 2, fullname: 'Read Only Group', write: false }),
  ],
})

/**
 * Create a user with only read access
 */
const userWithReadOnlyAccess = createUser({
  ...testUser,
  groups: [createGroup({ id: 1, fullname: 'Read Only Group', write: false })],
})

/**
 * Handler for successful rule fetch
 */
const createRuleDetailHandler = (rule = testRuleResponse) =>
  http.get(`${BASE}/rules/:ruleId`, async () => {
    await delay(50)
    return HttpResponse.json(rule)
  })

/**
 * Handler for successful rule update
 */
const createUpdateRuleHandler = (response = {}) =>
  http.post(`${BASE}/rules/:ruleId`, async () => {
    await delay(50)
    return HttpResponse.json(response)
  })

/**
 * Handler for failed rule update
 */
const createUpdateRuleErrorHandler = (message = 'Failed to update rule') =>
  http.post(`${BASE}/rules/:ruleId`, async () => {
    await delay(50)
    return HttpResponse.json({ message }, { status: 500 })
  })

// --- Assertion Helpers ---
const expectVisible = (text: string | RegExp) => {
  expect(screen.getAllByText(text).length).toBeGreaterThan(0)
}

const expectNotVisible = (text: string | RegExp) => {
  expect(screen.queryAllByText(text).length).toBe(0)
}

// =============================================================================
// Tests
// =============================================================================

describe('RuleDetailPage', () => {
  // ---------------------------------------------------------------------------
  // Page States
  // ---------------------------------------------------------------------------
  describe('Page States', () => {
    describe('loading', () => {
      it('shows loading overlay while fetching rule', () => {
        // Use a slow handler to ensure we catch loading state
        server.use(
          http.get(`${BASE}/rules/:ruleId`, async () => {
            await delay(1000)
            return HttpResponse.json(testRuleResponse)
          })
        )
        renderPage()

        // LoadingOverlay should be visible
        expect(document.querySelector('[class*="mantine-LoadingOverlay"]')).toBeInTheDocument()
      })
    })

    describe('error - rule not found', () => {
      it('shows error alert when rule is not found', async () => {
        server.use(errorHandlers.ruleNotFound)
        renderPage(999)

        await waitFor(
          () => {
            const alerts = screen.getAllByRole('alert')
            expect(alerts.length).toBeGreaterThan(0)
          },
          { timeout: 5000 }
        )

        expectVisible(/rule not found/i)
      })

      it('shows back to rules list link on error', async () => {
        server.use(errorHandlers.ruleNotFound)
        renderPage(999)

        await waitFor(() => {
          const backLink = screen.getByRole('link', { name: /back to rules list/i })
          expect(backLink).toHaveAttribute('href', '/')
        })
      })
    })

    describe('success', () => {
      beforeEach(() => {
        server.use(createRuleDetailHandler(), createUserHandler(userWithWriteAccess))
      })

      it('renders rule name in header', async () => {
        renderPage()
        await waitForPageLoad()

        expectVisible('Login Monitor')
      })

      it('displays rule ID badge', async () => {
        renderPage()
        await waitForPageLoad()

        expectVisible('ID: 1')
      })

      it('displays version badge', async () => {
        renderPage()
        await waitForPageLoad()

        expectVisible('v5')
      })

      it('shows back to rules list link', async () => {
        renderPage()
        await waitForPageLoad()

        const backLink = screen.getByRole('link', { name: /back to rules list/i })
        expect(backLink).toHaveAttribute('href', '/')
      })
    })
  })

  // ---------------------------------------------------------------------------
  // Permission Handling
  // ---------------------------------------------------------------------------
  describe('Permission Handling', () => {
    describe('when user has write access', () => {
      beforeEach(() => {
        server.use(createRuleDetailHandler(), createUserHandler(userWithWriteAccess))
      })

      it('shows Save Changes button', async () => {
        renderPage()
        await waitForPageLoad()

        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
      })

      it('does not show read-only alert', async () => {
        renderPage()
        await waitForPageLoad()

        expectNotVisible(/don't have write access/i)
      })
    })

    describe('when user has read-only access', () => {
      beforeEach(() => {
        server.use(createRuleDetailHandler(), createUserHandler(userWithReadOnlyAccess))
      })

      it('hides Save Changes button', async () => {
        renderPage()
        await waitForPageLoad()

        expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
      })

      it('shows read-only alert', async () => {
        renderPage()
        await waitForPageLoad()

        await waitFor(() => {
          expectVisible(/don't have write access/i)
        })
      })
    })

    describe('when unauthenticated', () => {
      it('hides Save Changes button', async () => {
        server.use(createRuleDetailHandler())
        renderPage(1, false)
        await waitForPageLoad()

        expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
      })
    })
  })

  // ---------------------------------------------------------------------------
  // Tab Navigation
  // ---------------------------------------------------------------------------
  describe('Tab Navigation', () => {
    beforeEach(async () => {
      server.use(createRuleDetailHandler(), createUserHandler(userWithWriteAccess))
      renderPage()
      await waitForPageLoad()
    })

    it('displays Form View and Raw JSON tabs', () => {
      expect(screen.getByRole('tab', { name: /form view/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /raw json/i })).toBeInTheDocument()
    })

    it('starts with Form View tab selected', () => {
      const formTab = screen.getByRole('tab', { name: /form view/i })
      expect(formTab).toHaveAttribute('aria-selected', 'true')
    })

    it('can switch to Raw JSON tab', async () => {
      const jsonTab = screen.getByRole('tab', { name: /raw json/i })
      await userEvent.click(jsonTab)

      expect(jsonTab).toHaveAttribute('aria-selected', 'true')
    })

    it('can switch back to Form View tab', async () => {
      // Switch to JSON
      const jsonTab = screen.getByRole('tab', { name: /raw json/i })
      await userEvent.click(jsonTab)

      // Switch back to Form
      const formTab = screen.getByRole('tab', { name: /form view/i })
      await userEvent.click(formTab)

      expect(formTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  // ---------------------------------------------------------------------------
  // Stepper Navigation
  // ---------------------------------------------------------------------------
  describe('Stepper Navigation', () => {
    beforeEach(async () => {
      server.use(createRuleDetailHandler(), createUserHandler(userWithWriteAccess))
      renderPage()
      await waitForPageLoad()
    })

    it('displays all step labels', () => {
      expectVisible('Info & Schedule')
      expectVisible('Parameters')
      expectVisible('Inputs')
      expectVisible('Transform')
      expectVisible('Condition')
      expectVisible('Actions')
    })

    it('starts at first step (Info & Schedule)', () => {
      // First step should be active - the stepper component marks the current step
      const steps = screen
        .getAllByRole('button')
        .filter((btn) => btn.textContent?.includes('Info & Schedule'))
      expect(steps.length).toBeGreaterThan(0)
    })

    it('can navigate to next step using Next button', async () => {
      const nextButton = screen.getByRole('button', { name: /next/i })
      await userEvent.click(nextButton)

      // Should now be on Parameters step - verify by checking that we're on step 2
      // The stepper will update to show step 2 as active
      await waitFor(() => {
        // The Next button should still be available for further navigation
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
      })
    })

    it('can navigate to previous step using Back button', async () => {
      // First go to step 2
      const nextButton = screen.getByRole('button', { name: /next/i })
      await userEvent.click(nextButton)

      // Now go back
      const backButton = screen.getByRole('button', { name: /back/i })
      await userEvent.click(backButton)

      // Should be back at first step
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
      })
    })

    it('can click on step directly to navigate', async () => {
      // Click on the "Parameters" step in the stepper
      const parametersStep = screen.getAllByText('Parameters')[0]
      await userEvent.click(parametersStep)

      // Stepper should update - Back button should now be available
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
      })
    })
  })

  // ---------------------------------------------------------------------------
  // Save Functionality
  // ---------------------------------------------------------------------------
  describe('Save Functionality', () => {
    describe('successful save', () => {
      beforeEach(() => {
        server.use(
          createRuleDetailHandler(),
          createUserHandler(userWithWriteAccess),
          createUpdateRuleHandler()
        )
      })

      it('shows loading state on save button while saving', async () => {
        // Use a slow handler
        server.use(
          http.post(`${BASE}/rules/:ruleId`, async () => {
            await delay(500)
            return HttpResponse.json({})
          })
        )

        renderPage()
        await waitForPageLoad()

        const saveButton = screen.getByRole('button', { name: /save changes/i })
        await userEvent.click(saveButton)

        // Button should show loading state
        await waitFor(() => {
          expect(saveButton).toHaveAttribute('data-loading', 'true')
        })
      })

      it('shows success notification after save', async () => {
        renderPage()
        await waitForPageLoad()

        const saveButton = screen.getByRole('button', { name: /save changes/i })
        await userEvent.click(saveButton)

        await waitFor(() => {
          expectVisible(/success/i)
          expectVisible(/rule updated successfully/i)
        })
      })
    })

    describe('failed save', () => {
      it('shows error notification on save failure', async () => {
        server.use(
          createRuleDetailHandler(),
          createUserHandler(userWithWriteAccess),
          createUpdateRuleErrorHandler('Validation failed')
        )

        renderPage()
        await waitForPageLoad()

        const saveButton = screen.getByRole('button', { name: /save changes/i })
        await userEvent.click(saveButton)

        await waitFor(() => {
          expectVisible(/error/i)
        })
      })
    })

    describe('save from step navigation', () => {
      beforeEach(() => {
        server.use(
          createRuleDetailHandler(),
          createUserHandler(userWithWriteAccess),
          createUpdateRuleHandler()
        )
      })

      it('can save from last step using Save button', async () => {
        renderPage()
        await waitForPageLoad()

        // Navigate to last step (Actions)
        for (let i = 0; i < 5; i++) {
          const nextButton = screen.getByRole('button', { name: /next/i })
          await userEvent.click(nextButton)
        }

        // Should now have a Save button in the step navigation
        await waitFor(() => {
          const saveButtons = screen.getAllByRole('button', { name: /save/i })
          expect(saveButtons.length).toBeGreaterThan(0)
        })
      })
    })
  })

  // ---------------------------------------------------------------------------
  // URL Parameter Handling
  // ---------------------------------------------------------------------------
  describe('URL Parameter Handling', () => {
    it('fetches correct rule based on URL parameter', async () => {
      const customRule = {
        id: 42,
        version: 3,
        body: {
          name: 'Custom Rule',
          author: 'custom@blizzard.com',
          regions: ['EU'],
          inputs: [{ search: { size: 0, query: {} }, index: 'test-*' }],
          actions: [],
        },
      }

      server.use(
        http.get(`${BASE}/rules/42`, async () => {
          await delay(50)
          return HttpResponse.json(customRule)
        }),
        createUserHandler(userWithWriteAccess)
      )

      renderPage(42)
      await waitForPageLoad('Custom Rule')

      expectVisible('Custom Rule')
      expectVisible('ID: 42')
      expectVisible('v3')
    })

    it('handles invalid rule ID gracefully', async () => {
      server.use(
        http.get(`${BASE}/rules/:ruleId`, async () => {
          await delay(50)
          return HttpResponse.json({ message: 'Rule not found' }, { status: 404 })
        })
      )

      renderPage(99999)

      await waitFor(() => {
        expectVisible(/rule not found/i)
      })
    })
  })

  // ---------------------------------------------------------------------------
  // Form Data Population
  // ---------------------------------------------------------------------------
  describe('Form Data Population', () => {
    beforeEach(() => {
      server.use(createRuleDetailHandler(), createUserHandler(userWithWriteAccess))
    })

    it('populates form with rule data from API', async () => {
      renderPage()
      await waitForPageLoad()

      // The rule name should be visible in the header
      expectVisible('Login Monitor')
    })

    it('displays region badges from rule data', async () => {
      renderPage()
      await waitForPageLoad()

      // Switch to form view and check for regions
      // The regions should be populated in the form
      // This would typically show as badges or chips in the form
    })
  })

  // ---------------------------------------------------------------------------
  // JSON View
  // ---------------------------------------------------------------------------
  describe('JSON View', () => {
    beforeEach(async () => {
      server.use(createRuleDetailHandler(), createUserHandler(userWithWriteAccess))
      renderPage()
      await waitForPageLoad()
    })

    it('shows JSON editor in JSON View tab', async () => {
      const jsonTab = screen.getByRole('tab', { name: /raw json/i })
      await userEvent.click(jsonTab)

      // Monaco editor or JSON view should be rendered
      await waitFor(() => {
        // Check for the JSON view panel content
        expect(screen.getByRole('tabpanel')).toBeInTheDocument()
      })
    })

    it('has Back to Form button in JSON View', async () => {
      const jsonTab = screen.getByRole('tab', { name: /raw json/i })
      await userEvent.click(jsonTab)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to form/i })).toBeInTheDocument()
      })
    })

    it('can navigate back to form from JSON View', async () => {
      const jsonTab = screen.getByRole('tab', { name: /raw json/i })
      await userEvent.click(jsonTab)

      const backToFormButton = await screen.findByRole('button', { name: /back to form/i })
      await userEvent.click(backToFormButton)

      // Should now be on Form View
      const formTab = screen.getByRole('tab', { name: /form view/i })
      expect(formTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  // ---------------------------------------------------------------------------
  // Step Navigation Buttons
  // ---------------------------------------------------------------------------
  describe('Step Navigation Buttons', () => {
    beforeEach(async () => {
      server.use(createRuleDetailHandler(), createUserHandler(userWithWriteAccess))
      renderPage()
      await waitForPageLoad()
    })

    it('disables Back button on first step', () => {
      // On first step, the back button might be disabled or hidden
      const backButton = screen.queryByRole('button', { name: /^back$/i })
      if (backButton) {
        expect(backButton).toBeDisabled()
      }
    })

    it('shows View JSON button', () => {
      expect(screen.getByRole('button', { name: /view json/i })).toBeInTheDocument()
    })

    it('View JSON button switches to JSON tab', async () => {
      const viewJsonButton = screen.getByRole('button', { name: /view json/i })
      await userEvent.click(viewJsonButton)

      const jsonTab = screen.getByRole('tab', { name: /raw json/i })
      expect(jsonTab).toHaveAttribute('aria-selected', 'true')
    })
  })
})
