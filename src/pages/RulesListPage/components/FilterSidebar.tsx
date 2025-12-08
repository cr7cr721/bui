import {
  Paper,
  Stack,
  Text,
  TextInput,
  Select,
  Button,
  Divider,
  Group,
  Badge,
  Box,
  ThemeIcon,
  Collapse,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconSearch,
  IconFilter,
  IconFilterOff,
  IconWorld,
  IconUsers,
  IconToggleLeft,
  IconChevronDown,
  IconChevronRight,
  IconList,
} from '@tabler/icons-react'
import { useStore } from '@/store/useStore'
import { useUser, useRegions } from '@/hooks/useApi'

interface FilterSidebarProps {
  totalRules: number
  filteredRules: number
  mobile?: boolean
}

export const FilterSidebar = ({ totalRules, filteredRules, mobile }: FilterSidebarProps) => {
  const { filters, setFilters, resetFilters } = useStore()
  const { data: user } = useUser()
  const { data: regions } = useRegions()
  const [filtersOpen, { toggle: toggleFilters }] = useDisclosure(true)

  const hasActiveFilters = filters.search || filters.enabled !== 'all'
  const isFiltered = filteredRules !== totalRules

  const handleFilterChange = (key: string, value: string | null) => {
    setFilters({ [key]: value || '' })
  }

  const handleReset = () => {
    resetFilters()
  }

  const sidebarContent = (
    <Stack gap="md">
      {/* Header with stats */}
      <Box>
        <Group justify="space-between" mb="xs">
          <Group gap="xs">
            <ThemeIcon size="sm" variant="light" color="blue">
              <IconList size={14} />
            </ThemeIcon>
            <Text size="sm" fw={600}>
              Rules
            </Text>
          </Group>
          <Badge variant="light" color={isFiltered ? 'blue' : 'gray'} size="sm">
            {filteredRules} / {totalRules}
          </Badge>
        </Group>
        {isFiltered && (
          <Text size="xs" c="dimmed">
            Showing {filteredRules} of {totalRules} rules
          </Text>
        )}
      </Box>

      <Divider />

      {/* Collapsible Filters Section */}
      <Box>
        <Button
          variant="subtle"
          color="gray"
          fullWidth
          justify="space-between"
          rightSection={
            filtersOpen ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />
          }
          leftSection={<IconFilter size={16} />}
          onClick={toggleFilters}
          styles={{
            root: { paddingLeft: 0, paddingRight: 0 },
            inner: { justifyContent: 'space-between' },
          }}
        >
          <Group gap="xs">
            <Text size="sm" fw={500}>
              Filters
            </Text>
            {hasActiveFilters && (
              <Badge size="xs" color="blue" variant="filled">
                Active
              </Badge>
            )}
          </Group>
        </Button>

        <Collapse in={filtersOpen}>
          <Stack gap="md" mt="md">
            {/* Region Filter */}
            <Box>
              <Group gap="xs" mb={6}>
                <IconWorld size={14} style={{ color: 'var(--mantine-color-dimmed)' }} />
                <Text size="xs" fw={500} c="dimmed" tt="uppercase">
                  Region
                </Text>
              </Group>
              <Select
                placeholder="Select region"
                size="sm"
                data={
                  regions?.map((region) => ({
                    value: region.name,
                    label: `${region.name} - ${region.description}`,
                  })) || []
                }
                value={filters.region}
                onChange={(value) => handleFilterChange('region', value)}
                comboboxProps={{ withinPortal: true }}
              />
            </Box>

            {/* Group Filter */}
            <Box>
              <Group gap="xs" mb={6}>
                <IconUsers size={14} style={{ color: 'var(--mantine-color-dimmed)' }} />
                <Text size="xs" fw={500} c="dimmed" tt="uppercase">
                  Group
                </Text>
              </Group>
              <Select
                placeholder="Select group"
                size="sm"
                data={
                  user?.groups?.map((group) => ({
                    value: group.id.toString(),
                    label: group.fullname,
                  })) || []
                }
                value={filters.group}
                onChange={(value) => handleFilterChange('group', value)}
                comboboxProps={{ withinPortal: true }}
                searchable
                nothingFoundMessage="No groups found"
              />
            </Box>

            {/* Status Filter */}
            <Box>
              <Group gap="xs" mb={6}>
                <IconToggleLeft size={14} style={{ color: 'var(--mantine-color-dimmed)' }} />
                <Text size="xs" fw={500} c="dimmed" tt="uppercase">
                  Status
                </Text>
              </Group>
              <Select
                placeholder="Select status"
                size="sm"
                data={[
                  { value: 'all', label: 'All Rules' },
                  { value: 'enabled', label: 'Enabled Only' },
                  { value: 'disabled', label: 'Disabled Only' },
                ]}
                value={filters.enabled}
                onChange={(value) => handleFilterChange('enabled', value)}
                comboboxProps={{ withinPortal: true }}
              />
            </Box>

            {/* Search */}
            <Box>
              <Group gap="xs" mb={6}>
                <IconSearch size={14} style={{ color: 'var(--mantine-color-dimmed)' }} />
                <Text size="xs" fw={500} c="dimmed" tt="uppercase">
                  Search
                </Text>
              </Group>
              <TextInput
                placeholder="Search by name or author..."
                size="sm"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.currentTarget.value)}
                rightSection={
                  filters.search && (
                    <IconFilterOff
                      size={14}
                      style={{ cursor: 'pointer', opacity: 0.5 }}
                      onClick={() => handleFilterChange('search', '')}
                    />
                  )
                }
              />
            </Box>

            {/* Reset Button */}
            {hasActiveFilters && (
              <Button
                variant="light"
                color="gray"
                size="sm"
                leftSection={<IconFilterOff size={14} />}
                onClick={handleReset}
                fullWidth
              >
                Clear All Filters
              </Button>
            )}
          </Stack>
        </Collapse>
      </Box>

      <Divider />

      {/* Quick Stats */}
      <Box>
        <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb="sm">
          Quick Info
        </Text>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Region
            </Text>
            <Badge variant="outline" size="sm">
              {filters.region}
            </Badge>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Group
            </Text>
            <Badge variant="outline" size="sm">
              {user?.groups?.find((g) => g.id.toString() === filters.group)?.fullname || 'N/A'}
            </Badge>
          </Group>
        </Stack>
      </Box>
    </Stack>
  )

  // Mobile: render as a collapsible card
  if (mobile) {
    return (
      <Paper shadow="sm" p="md" withBorder>
        {sidebarContent}
      </Paper>
    )
  }

  // Desktop: render as sticky sidebar
  return (
    <Paper
      shadow="sm"
      p="md"
      withBorder
      style={{
        backgroundColor: 'var(--mantine-color-dark-7)',
        borderColor: 'var(--mantine-color-dark-5)',
      }}
    >
      {sidebarContent}
    </Paper>
  )
}
