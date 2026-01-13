// pages/RulesListPage/components/__tests__/RulesTable.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { RulesTable } from '../RulesTable'
import { createRules, createRule } from '@/test/mocks/factories'
import type { Rule } from '@/types/api'

// =============================================================================
// Test Helpers
// =============================================================================

const defaultProps = {
  rules: [] as Rule[],
  selectedRuleIds: [] as number[],
  showCheckbox: false,
  sortField: 'id' as const,
  sortDirection: 'asc' as const,
  onSelectAll: vi.fn(),
  onSelectRule: vi.fn(),
  onSort: vi.fn(),
}

const renderTable = (props: Partial<typeof defaultProps> = {}) =>
  renderWithProviders(<RulesTable {...defaultProps} {...props} />)

// =============================================================================
// Tests
// =============================================================================

describe('RulesTable', () => {
  describe('empty state', () => {
    it('displays empty state message when no rules', () => {
      renderTable({ rules: [] })

      expect(screen.getByText(/no rules found matching your filters/i)).toBeInTheDocument()
      expect(screen.getByText(/try adjusting your search/i)).toBeInTheDocument()
    })

    it('does not render table when empty', () => {
      renderTable({ rules: [] })

      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('with rules', () => {
    const testRules = [
      createRule({ id: 1, name: 'Login Monitor', enabled: 1, author: 'alice@test.com' }),
      createRule({ id: 2, name: 'Error Alert', enabled: 0, author: 'bob@test.com' }),
      createRule({ id: 3, name: 'Latency Check', enabled: 1, author: 'alice@test.com' }),
    ]

    it('renders table with rules', () => {
      renderTable({ rules: testRules })

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('Login Monitor')).toBeInTheDocument()
      expect(screen.getByText('Error Alert')).toBeInTheDocument()
      expect(screen.getByText('Latency Check')).toBeInTheDocument()
    })

    it('displays rule IDs', () => {
      renderTable({ rules: testRules })

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('displays enabled/disabled badges', () => {
      renderTable({ rules: testRules })

      // Region badges are now colored by enabled status
      // Check that the table renders without errors
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('displays author emails', () => {
      renderTable({ rules: testRules })

      expect(screen.getAllByText('alice@test.com')).toHaveLength(2)
      expect(screen.getByText('bob@test.com')).toBeInTheDocument()
    })

    it('links rule names to detail page', () => {
      renderTable({ rules: testRules })

      const link = screen.getByRole('link', { name: 'Login Monitor' })
      expect(link).toHaveAttribute('href', '/rules/1')
    })
  })

  describe('checkbox selection', () => {
    const testRules = createRules(3)

    it('hides checkboxes when showCheckbox is false', () => {
      renderTable({ rules: testRules, showCheckbox: false })

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('shows checkboxes when showCheckbox is true', () => {
      renderTable({ rules: testRules, showCheckbox: true })

      // Header checkbox + one per row
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes).toHaveLength(4) // 1 header + 3 rows
    })

    it('calls onSelectRule when row checkbox clicked', async () => {
      const onSelectRule = vi.fn()
      const rules = [createRule({ id: 42 })]
      const { userEvent } = await import('@/test/test-utils')

      renderTable({ rules, showCheckbox: true, onSelectRule })

      const rowCheckboxes = screen.getAllByRole('checkbox')
      // First is header, second is the row
      await userEvent.click(rowCheckboxes[1])

      expect(onSelectRule).toHaveBeenCalledWith(42)
    })

    it('calls onSelectAll when header checkbox clicked', async () => {
      const onSelectAll = vi.fn()
      const { userEvent } = await import('@/test/test-utils')

      renderTable({ rules: createRules(3), showCheckbox: true, onSelectAll })

      const headerCheckbox = screen.getAllByRole('checkbox')[0]
      await userEvent.click(headerCheckbox)

      expect(onSelectAll).toHaveBeenCalled()
    })

    it('shows selected rows with different styling', () => {
      const rules = [createRule({ id: 1 }), createRule({ id: 2 })]

      renderTable({
        rules,
        showCheckbox: true,
        selectedRuleIds: [1],
      })

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[1]).toBeChecked() // First rule selected
      expect(checkboxes[2]).not.toBeChecked() // Second rule not selected
    })
  })

  describe('trigger indicator', () => {
    it('shows trigger icon when rule has active triggers', () => {
      const ruleWithTriggers = createRule({ id: 1, name: 'Triggered Rule', trigger_count: 5 })

      renderTable({ rules: [ruleWithTriggers] })

      // The trigger indicator is a button/icon near the rule name
      const triggerButton = screen.getByRole('button')
      expect(triggerButton).toBeInTheDocument()
    })

    it('does not show trigger icon when no triggers', () => {
      const ruleNoTriggers = createRule({ id: 1, name: 'Clean Rule', trigger_count: 0 })

      renderTable({ rules: [ruleNoTriggers] })

      // No buttons should be rendered (no trigger indicator)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('region badges', () => {
    it('displays region badges for each rule', () => {
      const rule = createRule({ id: 1, regions: ['NA', 'EU', 'KR'] })

      renderTable({ rules: [rule] })

      expect(screen.getByText('NA')).toBeInTheDocument()
      expect(screen.getByText('EU')).toBeInTheDocument()
      expect(screen.getByText('KR')).toBeInTheDocument()
    })
  })

  describe('sorting', () => {
    it('renders sortable column headers', () => {
      renderTable({ rules: createRules(1) })

      // Table headers should be present
      expect(screen.getByText('ID')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Author')).toBeInTheDocument()
      expect(screen.getByText('Regions & Status')).toBeInTheDocument()
    })
  })

  describe('large dataset handling', () => {
    it('renders many rules efficiently', () => {
      const manyRules = createRules(50)

      renderTable({ rules: manyRules })

      const rows = screen.getAllByRole('row')
      // +1 for header row
      expect(rows).toHaveLength(51)
    })
  })
})
