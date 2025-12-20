// pages/GroupsPage/components/__tests__/GroupsTable.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { GroupsTable } from '../GroupsTable'
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

const defaultProps = {
  groups: [] as Group[],
  isAdmin: false,
  onEdit: vi.fn(),
}

const renderTable = (props: Partial<typeof defaultProps> = {}) =>
  renderWithProviders(<GroupsTable {...defaultProps} {...props} />)

// =============================================================================
// Tests
// =============================================================================

describe('GroupsTable', () => {
  describe('rendering', () => {
    it('renders table with title showing group count', () => {
      renderTable({ groups: [createTestGroup(), createTestGroup({ id: 2 })] })

      expect(screen.getByText('Groups (2)')).toBeInTheDocument()
    })

    it('renders column headers', () => {
      renderTable()

      expect(screen.getByText('Full name')).toBeInTheDocument()
      expect(screen.getByText('CN LDAP group')).toBeInTheDocument()
      expect(screen.getByText('Access')).toBeInTheDocument()
    })

    it('renders zero count when no groups', () => {
      renderTable({ groups: [] })

      expect(screen.getByText('Groups (0)')).toBeInTheDocument()
    })
  })

  describe('with groups', () => {
    const testGroups: Group[] = [
      createTestGroup({ id: 1, fullname: 'Engineering Team', ad_group: 'AD-ENG', write: true }),
      createTestGroup({ id: 2, fullname: 'QA Team', ad_group: 'AD-QA', write: false }),
      createTestGroup({ id: 3, fullname: 'Design Team', ad_group: '', write: true }),
    ]

    it('renders all group names', () => {
      renderTable({ groups: testGroups })

      expect(screen.getByText('Engineering Team')).toBeInTheDocument()
      expect(screen.getByText('QA Team')).toBeInTheDocument()
      expect(screen.getByText('Design Team')).toBeInTheDocument()
    })

    it('renders AD group names', () => {
      renderTable({ groups: testGroups })

      expect(screen.getByText('AD-ENG')).toBeInTheDocument()
      expect(screen.getByText('AD-QA')).toBeInTheDocument()
    })

    it('displays dash for empty AD group', () => {
      renderTable({ groups: [createTestGroup({ ad_group: '' })] })

      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('shows Save Rules badge for groups with write access', () => {
      renderTable({ groups: testGroups })

      const badges = screen.getAllByText('Save Rules')
      expect(badges).toHaveLength(2) // Engineering and Design have write: true
    })

    it('does not show Save Rules badge for groups without write access', () => {
      renderTable({ groups: [createTestGroup({ write: false })] })

      expect(screen.queryByText('Save Rules')).not.toBeInTheDocument()
    })
  })

  describe('admin functionality', () => {
    const testGroups = [
      createTestGroup({ id: 1, fullname: 'Test Group 1' }),
      createTestGroup({ id: 2, fullname: 'Test Group 2' }),
    ]

    it('shows Edit Group button for each group when user is admin', () => {
      renderTable({ groups: testGroups, isAdmin: true })

      const editButtons = screen.getAllByRole('button', { name: /edit group/i })
      expect(editButtons).toHaveLength(2)
    })

    it('hides Edit Group button when user is not admin', () => {
      renderTable({ groups: testGroups, isAdmin: false })

      expect(screen.queryByRole('button', { name: /edit group/i })).not.toBeInTheDocument()
    })

    it('calls onEdit with correct group when Edit button is clicked', async () => {
      const onEdit = vi.fn()
      const group = createTestGroup({ id: 42, fullname: 'Clickable Group' })
      renderTable({ groups: [group], isAdmin: true, onEdit })

      const editButton = screen.getByRole('button', { name: /edit group/i })
      await userEvent.click(editButton)

      expect(onEdit).toHaveBeenCalledTimes(1)
      expect(onEdit).toHaveBeenCalledWith(group)
    })

    it('calls onEdit for correct group when multiple groups exist', async () => {
      const onEdit = vi.fn()
      const groups = [
        createTestGroup({ id: 1, fullname: 'First Group' }),
        createTestGroup({ id: 2, fullname: 'Second Group' }),
        createTestGroup({ id: 3, fullname: 'Third Group' }),
      ]
      renderTable({ groups, isAdmin: true, onEdit })

      const editButtons = screen.getAllByRole('button', { name: /edit group/i })
      await userEvent.click(editButtons[1]) // Click second button

      expect(onEdit).toHaveBeenCalledWith(groups[1])
    })
  })

  describe('large dataset', () => {
    it('renders many groups efficiently', () => {
      const manyGroups: Group[] = Array.from({ length: 20 }, (_, i) =>
        createTestGroup({
          id: i + 1,
          fullname: `Group ${i + 1}`,
          ad_group: `AD-GROUP-${i + 1}`,
          write: i % 2 === 0,
        })
      )

      renderTable({ groups: manyGroups })

      expect(screen.getByText('Groups (20)')).toBeInTheDocument()
      expect(screen.getByText('Group 1')).toBeInTheDocument()
      expect(screen.getByText('Group 20')).toBeInTheDocument()
    })
  })
})
