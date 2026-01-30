// pages/RulesListPage/components/__tests__/ViewChangesModal.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/test/test-utils'
import { ViewChangesModal } from '../ViewChangesModal'
import { server } from '@/test/mocks/server'
import { http, HttpResponse, delay } from 'msw'

const BASE = 'https://gdp-beam-api.dev.data.blz.dev'

describe('ViewChangesModal', () => {
  const defaultProps = {
    opened: true,
    onClose: vi.fn(),
    ruleId: 1,
    fromVersion: 1,
    toVersion: 2,
  }

  describe('rendering', () => {
    it('renders the modal title with version numbers', async () => {
      renderWithProviders(<ViewChangesModal {...defaultProps} />)

      expect(screen.getByText(/Changes from version 1 to 2/)).toBeInTheDocument()
    })

    it('renders the expand context checkbox', async () => {
      renderWithProviders(<ViewChangesModal {...defaultProps} />)

      expect(screen.getByLabelText(/Expand context for text nodes/)).toBeInTheDocument()
    })

    it('shows loading state while fetching versions', () => {
      renderWithProviders(<ViewChangesModal {...defaultProps} />)

      expect(screen.getByText(/Loading versions/)).toBeInTheDocument()
    })
  })

  describe('data fetching', () => {
    it('fetches both versions when opened', async () => {
      const fetchCalls: string[] = []

      server.use(
        http.get(`${BASE}/rules/:ruleId`, async ({ request }) => {
          await delay(50)
          const url = new URL(request.url)
          const version = url.searchParams.get('version')
          fetchCalls.push(`version=${version}`)

          return HttpResponse.json({
            id: 1,
            version: Number(version),
            body: {
              name: 'test',
              actions: version === '1' ? [{ old: true }] : [{ new: true }],
            },
          })
        })
      )

      renderWithProviders(<ViewChangesModal {...defaultProps} />)

      await waitFor(() => {
        expect(fetchCalls).toContain('version=1')
        expect(fetchCalls).toContain('version=2')
      })
    })

    it('displays diff after loading', async () => {
      server.use(
        http.get(`${BASE}/rules/:ruleId`, async ({ request }) => {
          await delay(50)
          const url = new URL(request.url)
          const version = url.searchParams.get('version')

          return HttpResponse.json({
            id: 1,
            version: Number(version),
            body: {
              ruleName: version === '1' ? 'old-name' : 'new-name',
              author: 'test@test.com',
            },
          })
        })
      )

      renderWithProviders(<ViewChangesModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.queryByText(/Loading versions/)).not.toBeInTheDocument()
      })

      // Should show the diff - look for the path that contains the changed field
      await waitFor(() => {
        expect(screen.getByText(/• ruleName/)).toBeInTheDocument()
      })
    })

    it('shows error state when fetch fails', async () => {
      server.use(
        http.get(`${BASE}/rules/:ruleId`, async () => {
          await delay(50)
          return HttpResponse.json({ message: 'Server error' }, { status: 500 })
        })
      )

      renderWithProviders(<ViewChangesModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/Failed to load rule versions/)).toBeInTheDocument()
      })
    })

    it('shows no changes message when versions are identical', async () => {
      server.use(
        http.get(`${BASE}/rules/:ruleId`, async () => {
          await delay(50)
          return HttpResponse.json({
            id: 1,
            version: 1,
            body: {
              name: 'same-name',
              author: 'test@test.com',
            },
          })
        })
      )

      renderWithProviders(<ViewChangesModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/No changes detected/)).toBeInTheDocument()
      })
    })
  })

  describe('interactions', () => {
    it('calls onClose when modal is closed', async () => {
      const onClose = vi.fn()
      renderWithProviders(<ViewChangesModal {...defaultProps} onClose={onClose} />)

      // Find the close button by its Mantine class (it doesn't have an accessible name)
      const closeButton = document.querySelector('.mantine-Modal-close') as HTMLButtonElement
      expect(closeButton).toBeInTheDocument()
      closeButton.click()

      expect(onClose).toHaveBeenCalled()
    })

    it('toggles expand context checkbox', async () => {
      const { userEvent } = await import('@/test/test-utils')
      renderWithProviders(<ViewChangesModal {...defaultProps} />)

      const checkbox = screen.getByLabelText(/Expand context for text nodes/)
      expect(checkbox).not.toBeChecked()

      await userEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })
  })

  describe('closed state', () => {
    it('does not render content when closed', () => {
      renderWithProviders(<ViewChangesModal {...defaultProps} opened={false} />)

      expect(screen.queryByText(/Changes from version/)).not.toBeInTheDocument()
    })
  })
})
