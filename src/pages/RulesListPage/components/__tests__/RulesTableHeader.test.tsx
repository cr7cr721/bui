// pages/RulesListPage/components/__tests__/RulesTableHeader.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { Table } from '@mantine/core'
import { RulesTableHeader } from '../RulesTableHeader'

// =============================================================================
// Test Helpers
// =============================================================================

type SortField = 'id' | 'name' | 'author' | 'group_name' | 'created' | 'updated'
type SortDirection = 'asc' | 'desc'

const defaultProps = {
  showCheckbox: false,
  allSelected: false,
  someSelected: false,
  sortField: 'id' as SortField,
  sortDirection: 'asc' as SortDirection,
  onSelectAll: vi.fn(),
  onSort: vi.fn(),
}

const renderHeader = (props: Partial<typeof defaultProps> = {}) =>
  render(
    <MantineProvider>
      <Table>
        <RulesTableHeader {...defaultProps} {...props} />
      </Table>
    </MantineProvider>
  )

// =============================================================================
// Tests
// =============================================================================

describe('RulesTableHeader', () => {
  describe('column headers', () => {
    it('displays ID column header', () => {
      renderHeader()

      expect(screen.getByText('ID')).toBeInTheDocument()
    })

    it('displays Name column header', () => {
      renderHeader()

      expect(screen.getByText('Name')).toBeInTheDocument()
    })

    it('displays Status column header', () => {
      renderHeader()

      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('displays Author column header', () => {
      renderHeader()

      expect(screen.getByText('Author')).toBeInTheDocument()
    })

    it('displays Group column header', () => {
      renderHeader()

      expect(screen.getByText('Group')).toBeInTheDocument()
    })

    it('displays Regions column header', () => {
      renderHeader()

      expect(screen.getByText('Regions')).toBeInTheDocument()
    })

    it('displays Updated column header', () => {
      renderHeader()

      expect(screen.getByText('Updated')).toBeInTheDocument()
    })
  })

  describe('checkbox', () => {
    it('hides checkbox when showCheckbox is false', () => {
      renderHeader({ showCheckbox: false })

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('shows checkbox when showCheckbox is true', () => {
      renderHeader({ showCheckbox: true })

      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('checkbox is checked when allSelected is true', () => {
      renderHeader({ showCheckbox: true, allSelected: true })

      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('checkbox is unchecked when allSelected is false', () => {
      renderHeader({ showCheckbox: true, allSelected: false, someSelected: false })

      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('checkbox is indeterminate when someSelected is true', () => {
      renderHeader({ showCheckbox: true, allSelected: false, someSelected: true })

      expect(screen.getByRole('checkbox')).toHaveAttribute('data-indeterminate', 'true')
    })

    it('calls onSelectAll when checkbox clicked', async () => {
      const onSelectAll = vi.fn()
      renderHeader({ showCheckbox: true, onSelectAll })

      await userEvent.click(screen.getByRole('checkbox'))

      expect(onSelectAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('sorting', () => {
    it('calls onSort with id when ID header clicked', async () => {
      const onSort = vi.fn()
      renderHeader({ onSort })

      await userEvent.click(screen.getByText('ID'))

      expect(onSort).toHaveBeenCalledWith('id')
    })

    it('calls onSort with name when Name header clicked', async () => {
      const onSort = vi.fn()
      renderHeader({ onSort })

      await userEvent.click(screen.getByText('Name'))

      expect(onSort).toHaveBeenCalledWith('name')
    })

    it('calls onSort with author when Author header clicked', async () => {
      const onSort = vi.fn()
      renderHeader({ onSort })

      await userEvent.click(screen.getByText('Author'))

      expect(onSort).toHaveBeenCalledWith('author')
    })

    it('calls onSort with group_name when Group header clicked', async () => {
      const onSort = vi.fn()
      renderHeader({ onSort })

      await userEvent.click(screen.getByText('Group'))

      expect(onSort).toHaveBeenCalledWith('group_name')
    })

    it('calls onSort with updated when Updated header clicked', async () => {
      const onSort = vi.fn()
      renderHeader({ onSort })

      await userEvent.click(screen.getByText('Updated'))

      expect(onSort).toHaveBeenCalledWith('updated')
    })

    it('does not call onSort when Status header clicked (not sortable)', async () => {
      const onSort = vi.fn()
      renderHeader({ onSort })

      await userEvent.click(screen.getByText('Status'))

      expect(onSort).not.toHaveBeenCalled()
    })

    it('does not call onSort when Regions header clicked (not sortable)', async () => {
      const onSort = vi.fn()
      renderHeader({ onSort })

      await userEvent.click(screen.getByText('Regions'))

      expect(onSort).not.toHaveBeenCalled()
    })
  })

  describe('sort indicators', () => {
    it('shows ascending indicator on sorted column', () => {
      renderHeader({ sortField: 'name', sortDirection: 'asc' })

      // Check for ChevronUp icon near Name header
      const nameHeader = screen.getByText('Name').closest('th')
      expect(nameHeader?.querySelector('svg')).toBeInTheDocument()
    })

    it('shows descending indicator on sorted column', () => {
      renderHeader({ sortField: 'name', sortDirection: 'desc' })

      // Check for ChevronDown icon near Name header
      const nameHeader = screen.getByText('Name').closest('th')
      expect(nameHeader?.querySelector('svg')).toBeInTheDocument()
    })

    it('shows selector icon on non-sorted columns', () => {
      renderHeader({ sortField: 'id' })

      // Name should show selector icon since it's not sorted
      const nameHeader = screen.getByText('Name').closest('th')
      expect(nameHeader?.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('renders table header structure', () => {
      renderHeader()

      expect(screen.getByRole('rowgroup')).toBeInTheDocument() // thead
      expect(screen.getByRole('row')).toBeInTheDocument() // tr
      expect(screen.getAllByRole('columnheader').length).toBeGreaterThan(0) // th
    })

    it('includes all expected column headers', () => {
      renderHeader({ showCheckbox: true })

      const headers = screen.getAllByRole('columnheader')
      // Checkbox + ID + Name + Status + Author + Group + Regions + Updated = 8
      expect(headers).toHaveLength(8)
    })
  })
})
