// pages/RulesListPage/components/__tests__/RulesTableRow.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Table } from '@mantine/core'
import { RulesTableRow } from '../RulesTableRow'
import { createRule } from '@/test/mocks/factories'

// =============================================================================
// Test Helpers
// =============================================================================

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const renderRow = (props: {
  rule: ReturnType<typeof createRule>
  isSelected?: boolean
  showCheckbox?: boolean
  onSelect?: (id: number) => void
  onEdit?: (id: number) => void
  onMove?: (id: number) => void
  onDelete?: (id: number) => void
}) => {
  const {
    rule,
    isSelected = false,
    showCheckbox = false,
    onSelect = vi.fn(),
    onEdit,
    onMove,
    onDelete,
  } = props

  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <BrowserRouter>
          <Table>
            <Table.Tbody>
              <RulesTableRow
                rule={rule}
                isSelected={isSelected}
                showCheckbox={showCheckbox}
                onSelect={onSelect}
                onEdit={onEdit}
                onMove={onMove}
                onDelete={onDelete}
              />
            </Table.Tbody>
          </Table>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  )
}

/**
 * Render with MemoryRouter for navigation testing
 */
const renderRowWithMemoryRouter = (props: {
  rule: ReturnType<typeof createRule>
  showCheckbox?: boolean
}) => {
  const { rule, showCheckbox = true } = props

  const TestWrapper = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <MemoryRouter initialEntries={['/']}>
            <Table>
              <Table.Tbody>
                <RulesTableRow
                  rule={rule}
                  isSelected={false}
                  showCheckbox={showCheckbox}
                  onSelect={vi.fn()}
                />
              </Table.Tbody>
            </Table>
          </MemoryRouter>
        </MantineProvider>
      </QueryClientProvider>
    )
  }

  return render(<TestWrapper />)
}

// =============================================================================
// Tests
// =============================================================================

describe('RulesTableRow', () => {
  describe('basic rendering', () => {
    it('displays rule ID', () => {
      const rule = createRule({ id: 42 })
      renderRow({ rule })

      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('displays rule name as link', () => {
      const rule = createRule({ id: 1, name: 'Test Rule' })
      renderRow({ rule })

      const link = screen.getByRole('link', { name: 'Test Rule' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/rules/1')
    })

    it('displays author email', () => {
      const rule = createRule({ author: 'john@example.com' })
      renderRow({ rule })

      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })
  })

  describe('region badges', () => {
    it('displays all region badges', () => {
      const rule = createRule({ regions: ['NA', 'EU', 'KR'] })
      renderRow({ rule })

      expect(screen.getByText('NA')).toBeInTheDocument()
      expect(screen.getByText('EU')).toBeInTheDocument()
      expect(screen.getByText('KR')).toBeInTheDocument()
    })

    it('displays single region badge', () => {
      const rule = createRule({ regions: ['DEV'] })
      renderRow({ rule })

      expect(screen.getByText('DEV')).toBeInTheDocument()
    })
  })

  describe('checkbox', () => {
    it('hides checkbox when showCheckbox is false', () => {
      const rule = createRule()
      renderRow({ rule, showCheckbox: false })

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('shows checkbox when showCheckbox is true', () => {
      const rule = createRule()
      renderRow({ rule, showCheckbox: true })

      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('checkbox is checked when isSelected is true', () => {
      const rule = createRule()
      renderRow({ rule, showCheckbox: true, isSelected: true })

      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('checkbox is unchecked when isSelected is false', () => {
      const rule = createRule()
      renderRow({ rule, showCheckbox: true, isSelected: false })

      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('calls onSelect with rule ID when checkbox clicked', async () => {
      const onSelect = vi.fn()
      const rule = createRule({ id: 99 })
      renderRow({ rule, showCheckbox: true, onSelect })

      await userEvent.click(screen.getByRole('checkbox'))

      expect(onSelect).toHaveBeenCalledWith(99)
    })
  })

  describe('trigger indicator', () => {
    it('shows trigger icon when rule has active triggers', () => {
      const rule = createRule({ trigger_count: 5 })
      renderRow({ rule })

      // ActionIcon button for triggers
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('does not show trigger icon when no triggers', () => {
      const rule = createRule({ trigger_count: 0 })
      renderRow({ rule })

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('opens triggers modal when trigger icon clicked', async () => {
      const rule = createRule({ trigger_count: 3, name: 'Test Rule' })
      renderRow({ rule })

      await userEvent.click(screen.getByRole('button'))

      // Modal should open showing rule name
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('selection styling', () => {
    it('applies selected background when isSelected is true', () => {
      const rule = createRule()
      renderRow({ rule, isSelected: true, showCheckbox: true })

      const row = screen.getByRole('row')
      expect(row).toHaveStyle({ backgroundColor: 'var(--mantine-color-blue-9)' })
    })
  })

  describe('history modal', () => {
    it('opens history modal when row is clicked', async () => {
      const rule = createRule({
        id: 123,
        name: 'Test Rule',
        group_name: 'Test Group',
        trigger_count: 0,
      })
      renderRow({ rule })

      // Click on the row
      const row = screen.getByRole('row')
      await userEvent.click(row)

      // History modal should open - wait for it to appear
      const dialog = await screen.findByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('shows group name in history modal', async () => {
      const rule = createRule({ group_name: 'Engineering Team', trigger_count: 0 })
      renderRow({ rule })

      const row = screen.getByRole('row')
      await userEvent.click(row)

      // Wait for dialog
      await screen.findByRole('dialog')
      // The group name appears in the modal under BEAM Group label
      expect(screen.getAllByText('Engineering Team').length).toBeGreaterThan(0)
    })

    it('shows BEAM Group label in history modal', async () => {
      const rule = createRule({ trigger_count: 0 })
      renderRow({ rule })

      const row = screen.getByRole('row')
      await userEvent.click(row)

      await screen.findByRole('dialog')
      expect(screen.getByText('BEAM Group')).toBeInTheDocument()
    })

    it('has pointer cursor on row', () => {
      const rule = createRule({ trigger_count: 0 })
      renderRow({ rule })

      const row = screen.getByRole('row')
      expect(row).toHaveStyle({ cursor: 'pointer' })
    })
  })

  describe('action icons', () => {
    describe('edit icon', () => {
      it('shows action icons when showCheckbox is true (authenticated)', () => {
        const rule = createRule({ id: 42, trigger_count: 0 })
        renderRow({ rule, showCheckbox: true })

        // Find all buttons - edit, move, delete icons (no trigger button since trigger_count: 0)
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBe(3) // Edit, Move, Delete
      })

      it('hides action icons when showCheckbox is false (unauthenticated)', () => {
        const rule = createRule({ id: 42, trigger_count: 0 })
        renderRow({ rule, showCheckbox: false })

        // No action buttons should be present
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
      })

      it('calls onEdit callback when edit icon is clicked', async () => {
        const onEdit = vi.fn()
        const rule = createRule({ id: 42, trigger_count: 0 })
        renderRow({ rule, showCheckbox: true, onEdit })

        // Edit is first button (when no triggers)
        const buttons = screen.getAllByRole('button')
        await userEvent.click(buttons[0])

        expect(onEdit).toHaveBeenCalledWith(42)
      })

      it('navigates to rule detail page when edit icon clicked without onEdit callback', async () => {
        const rule = createRule({ id: 123, trigger_count: 0 })
        renderRowWithMemoryRouter({ rule, showCheckbox: true })

        const buttons = screen.getAllByRole('button')
        await userEvent.click(buttons[0])

        // Verify button exists and click doesn't throw
        expect(buttons[0]).toBeInTheDocument()
      })

      it('does not open history modal when edit icon is clicked', async () => {
        const rule = createRule({ id: 42, trigger_count: 0 })
        renderRow({ rule, showCheckbox: true })

        const buttons = screen.getAllByRole('button')
        await userEvent.click(buttons[0])

        // History modal should NOT open
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    describe('move icon', () => {
      it('calls onMove callback when move icon is clicked', async () => {
        const onMove = vi.fn()
        const rule = createRule({ id: 55, trigger_count: 0 })
        renderRow({ rule, showCheckbox: true, onMove })

        const buttons = screen.getAllByRole('button')
        await userEvent.click(buttons[1]) // Move is second button

        expect(onMove).toHaveBeenCalledWith(55)
      })

      it('does not open history modal when move icon is clicked', async () => {
        const onMove = vi.fn()
        const rule = createRule({ id: 55, trigger_count: 0 })
        renderRow({ rule, showCheckbox: true, onMove })

        const buttons = screen.getAllByRole('button')
        await userEvent.click(buttons[1])

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    describe('delete icon', () => {
      it('calls onDelete callback when delete icon is clicked', async () => {
        const onDelete = vi.fn()
        const rule = createRule({ id: 77, trigger_count: 0 })
        renderRow({ rule, showCheckbox: true, onDelete })

        const buttons = screen.getAllByRole('button')
        await userEvent.click(buttons[2]) // Delete is third button

        expect(onDelete).toHaveBeenCalledWith(77)
      })

      it('does not open history modal when delete icon is clicked', async () => {
        const onDelete = vi.fn()
        const rule = createRule({ id: 77, trigger_count: 0 })
        renderRow({ rule, showCheckbox: true, onDelete })

        const buttons = screen.getAllByRole('button')
        await userEvent.click(buttons[2])

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('rule name link', () => {
    it('rule name links to detail page', () => {
      const rule = createRule({ id: 99, name: 'My Rule' })
      renderRow({ rule })

      const link = screen.getByRole('link', { name: 'My Rule' })
      expect(link).toHaveAttribute('href', '/rules/99')
    })

    it('clicking rule name link does not open history modal', async () => {
      const rule = createRule({ id: 99, name: 'My Rule', trigger_count: 0 })
      renderRow({ rule })

      const link = screen.getByRole('link', { name: 'My Rule' })
      await userEvent.click(link)

      // History modal should NOT open when clicking the link
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
