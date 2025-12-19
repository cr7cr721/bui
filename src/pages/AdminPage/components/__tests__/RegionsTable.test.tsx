// pages/AdminPage/components/__tests__/RegionsTable.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { RegionsTable } from '../RegionsTable'
import userEvent from '@testing-library/user-event'

// =============================================================================
// Test Helpers
// =============================================================================

interface Region {
  name: string
  isDisabled: boolean
}

const defaultProps = {
  regions: [] as Region[],
  isTogglingRegion: false,
  onToggleRegion: vi.fn(),
}

const renderTable = (props: Partial<typeof defaultProps> = {}) =>
  renderWithProviders(<RegionsTable {...defaultProps} {...props} />)

// =============================================================================
// Tests
// =============================================================================

describe('RegionsTable', () => {
  describe('rendering', () => {
    it('renders table with title', () => {
      renderTable()

      expect(screen.getByText('Chromie Datacenters')).toBeInTheDocument()
    })

    it('renders description text', () => {
      renderTable()

      expect(
        screen.getByText(/disabling a datacenter will cause beam rules to not send requests/i)
      ).toBeInTheDocument()
    })

    it('renders column headers', () => {
      renderTable()

      expect(screen.getByText('Region')).toBeInTheDocument()
      expect(screen.getByText('Enabled')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('displays no regions message when regions array is empty', () => {
      renderTable({ regions: [] })

      expect(screen.getByText(/no regions available/i)).toBeInTheDocument()
    })

    it('does not render any switches when empty', () => {
      renderTable({ regions: [] })

      expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    })
  })

  describe('with regions', () => {
    const testRegions: Region[] = [
      { name: 'us-west', isDisabled: false },
      { name: 'us-east', isDisabled: false },
      { name: 'eu-west', isDisabled: true },
    ]

    it('renders all region names', () => {
      renderTable({ regions: testRegions })

      expect(screen.getByText('us-west')).toBeInTheDocument()
      expect(screen.getByText('us-east')).toBeInTheDocument()
      expect(screen.getByText('eu-west')).toBeInTheDocument()
    })

    it('renders a switch for each region', () => {
      renderTable({ regions: testRegions })

      const switches = screen.getAllByRole('switch')
      expect(switches).toHaveLength(3)
    })

    it('shows enabled regions as checked', () => {
      renderTable({
        regions: [{ name: 'us-west', isDisabled: false }],
      })

      const toggle = screen.getByRole('switch')
      expect(toggle).toBeChecked()
    })

    it('shows disabled regions as unchecked', () => {
      renderTable({
        regions: [{ name: 'eu-west', isDisabled: true }],
      })

      const toggle = screen.getByRole('switch')
      expect(toggle).not.toBeChecked()
    })

    it('displays On label when region is enabled', () => {
      renderTable({
        regions: [{ name: 'us-west', isDisabled: false }],
      })

      expect(screen.getByText('On')).toBeInTheDocument()
    })

    it('displays Off label when region is disabled', () => {
      renderTable({
        regions: [{ name: 'eu-west', isDisabled: true }],
      })

      expect(screen.getByText('Off')).toBeInTheDocument()
    })
  })

  describe('toggle interaction', () => {
    it('calls onToggleRegion with correct args when enabled region is toggled', async () => {
      const onToggleRegion = vi.fn()
      renderTable({
        regions: [{ name: 'us-west', isDisabled: false }],
        onToggleRegion,
      })

      const toggle = screen.getByRole('switch')
      await userEvent.click(toggle)

      expect(onToggleRegion).toHaveBeenCalledTimes(1)
      expect(onToggleRegion).toHaveBeenCalledWith('us-west', false)
    })

    it('calls onToggleRegion with correct args when disabled region is toggled', async () => {
      const onToggleRegion = vi.fn()
      renderTable({
        regions: [{ name: 'eu-west', isDisabled: true }],
        onToggleRegion,
      })

      const toggle = screen.getByRole('switch')
      await userEvent.click(toggle)

      expect(onToggleRegion).toHaveBeenCalledTimes(1)
      expect(onToggleRegion).toHaveBeenCalledWith('eu-west', true)
    })

    it('calls onToggleRegion for correct region when multiple exist', async () => {
      const onToggleRegion = vi.fn()
      renderTable({
        regions: [
          { name: 'us-west', isDisabled: false },
          { name: 'us-east', isDisabled: false },
          { name: 'eu-west', isDisabled: true },
        ],
        onToggleRegion,
      })

      const switches = screen.getAllByRole('switch')

      // Click the second switch (us-east)
      await userEvent.click(switches[1])

      expect(onToggleRegion).toHaveBeenCalledWith('us-east', false)
    })
  })

  describe('loading state', () => {
    it('disables all switches when isTogglingRegion is true', () => {
      renderTable({
        regions: [
          { name: 'us-west', isDisabled: false },
          { name: 'us-east', isDisabled: false },
        ],
        isTogglingRegion: true,
      })

      const switches = screen.getAllByRole('switch')
      switches.forEach((toggle) => {
        expect(toggle).toBeDisabled()
      })
    })

    it('enables all switches when isTogglingRegion is false', () => {
      renderTable({
        regions: [
          { name: 'us-west', isDisabled: false },
          { name: 'us-east', isDisabled: false },
        ],
        isTogglingRegion: false,
      })

      const switches = screen.getAllByRole('switch')
      switches.forEach((toggle) => {
        expect(toggle).not.toBeDisabled()
      })
    })
  })

  describe('large dataset', () => {
    it('renders many regions efficiently', () => {
      const manyRegions: Region[] = Array.from({ length: 20 }, (_, i) => ({
        name: `region-${i + 1}`,
        isDisabled: i % 3 === 0,
      }))

      renderTable({ regions: manyRegions })

      const switches = screen.getAllByRole('switch')
      expect(switches).toHaveLength(20)

      // Verify first and last are rendered
      expect(screen.getByText('region-1')).toBeInTheDocument()
      expect(screen.getByText('region-20')).toBeInTheDocument()
    })
  })
})
