// pages/RulesListPage/components/__tests__/RulesTableRow.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
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
}) => {
  const { rule, isSelected = false, showCheckbox = false, onSelect = vi.fn() } = props

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
              />
            </Table.Tbody>
          </Table>
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  )
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

    it('displays group name', () => {
      const rule = createRule({ group_name: 'Engineering Team' })
      renderRow({ rule })

      expect(screen.getByText('Engineering Team')).toBeInTheDocument()
    })
  })

  describe('status badge', () => {
    it('shows Enabled badge for enabled rules', () => {
      const rule = createRule({ enabled: 1 })
      renderRow({ rule })

      expect(screen.getByText('Enabled')).toBeInTheDocument()
    })

    it('shows Disabled badge for disabled rules', () => {
      const rule = createRule({ enabled: 0 })
      renderRow({ rule })

      expect(screen.getByText('Disabled')).toBeInTheDocument()
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

  describe('date display', () => {
    it('displays formatted updated date', () => {
      const timestamp = new Date('2024-06-15T10:30:00Z').getTime() / 1000
      const rule = createRule({ updated: timestamp })
      renderRow({ rule })

      // Date format varies by locale
      expect(screen.getByText(/6\/15\/2024|15\/6\/2024/)).toBeInTheDocument()
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
})
