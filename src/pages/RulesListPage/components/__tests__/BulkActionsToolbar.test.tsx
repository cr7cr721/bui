// pages/RulesListPage/components/__tests__/BulkActionsToolbar.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { BulkActionsToolbar } from '../BulkActionsToolbar'

// =============================================================================
// Test Helpers
// =============================================================================

const defaultProps = {
  selectedCount: 0,
  onClearSelection: vi.fn(),
  onMoveToGroup: vi.fn(),
  onDelete: vi.fn(),
}

const renderToolbar = (props: Partial<typeof defaultProps> = {}) =>
  renderWithProviders(<BulkActionsToolbar {...defaultProps} {...props} />)

// =============================================================================
// Tests
// =============================================================================

describe('BulkActionsToolbar', () => {
  describe('no selection state', () => {
    it('shows placeholder text when no rules selected', () => {
      renderToolbar({ selectedCount: 0 })

      expect(screen.getByText(/select rules to perform bulk actions/i)).toBeInTheDocument()
    })

    it('disables Move button when no selection', () => {
      renderToolbar({ selectedCount: 0 })

      const moveButton = screen.getByRole('button', { name: /move/i })
      expect(moveButton).toBeDisabled()
    })

    it('disables Delete button when no selection', () => {
      renderToolbar({ selectedCount: 0 })

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(deleteButton).toBeDisabled()
    })

    it('does not show Clear button when no selection', () => {
      renderToolbar({ selectedCount: 0 })

      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
    })
  })

  describe('with selection', () => {
    it('shows selection count badge', () => {
      renderToolbar({ selectedCount: 5 })

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('shows singular "rule selected" for one rule', () => {
      renderToolbar({ selectedCount: 1 })

      expect(screen.getByText(/rule selected/i)).toBeInTheDocument()
      expect(screen.queryByText(/rules selected/i)).not.toBeInTheDocument()
    })

    it('shows plural "rules selected" for multiple rules', () => {
      renderToolbar({ selectedCount: 3 })

      expect(screen.getByText(/rules selected/i)).toBeInTheDocument()
    })

    it('enables Move button when rules selected', () => {
      renderToolbar({ selectedCount: 2 })

      const moveButton = screen.getByRole('button', { name: /move/i })
      expect(moveButton).not.toBeDisabled()
    })

    it('enables Delete button when rules selected', () => {
      renderToolbar({ selectedCount: 2 })

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      expect(deleteButton).not.toBeDisabled()
    })

    it('shows Clear button when rules selected', () => {
      renderToolbar({ selectedCount: 2 })

      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onClearSelection when Clear clicked', async () => {
      const onClearSelection = vi.fn()
      renderToolbar({ selectedCount: 3, onClearSelection })

      await userEvent.click(screen.getByRole('button', { name: /clear/i }))

      expect(onClearSelection).toHaveBeenCalledTimes(1)
    })

    it('calls onMoveToGroup when Move clicked', async () => {
      const onMoveToGroup = vi.fn()
      renderToolbar({ selectedCount: 2, onMoveToGroup })

      await userEvent.click(screen.getByRole('button', { name: /move/i }))

      expect(onMoveToGroup).toHaveBeenCalledTimes(1)
    })

    it('calls onDelete when Delete clicked', async () => {
      const onDelete = vi.fn()
      renderToolbar({ selectedCount: 2, onDelete })

      await userEvent.click(screen.getByRole('button', { name: /delete/i }))

      expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('does not call onMoveToGroup when disabled', async () => {
      const onMoveToGroup = vi.fn()
      renderToolbar({ selectedCount: 0, onMoveToGroup })

      const moveButton = screen.getByRole('button', { name: /move/i })
      await userEvent.click(moveButton)

      expect(onMoveToGroup).not.toHaveBeenCalled()
    })

    it('does not call onDelete when disabled', async () => {
      const onDelete = vi.fn()
      renderToolbar({ selectedCount: 0, onDelete })

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await userEvent.click(deleteButton)

      expect(onDelete).not.toHaveBeenCalled()
    })
  })

  describe('visual states', () => {
    it('renders with default styling when no selection', () => {
      const { container } = renderToolbar({ selectedCount: 0 })

      const paper = container.querySelector('.mantine-Paper-root')
      expect(paper).toBeInTheDocument()
    })

    it('renders selection count in badge', () => {
      renderToolbar({ selectedCount: 10 })

      const badge = screen.getByText('10')
      expect(badge).toBeInTheDocument()
    })
  })
})
