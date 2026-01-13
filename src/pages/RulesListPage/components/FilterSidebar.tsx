import { useMemo } from 'react'
import {
  Paper,
  Stack,
  Text,
  TextInput,
  Select,
  Divider,
  Group,
  Badge,
  Box,
  SegmentedControl,
  ActionIcon,
  Tooltip,
  Chip,
} from '@mantine/core'
import { IconSearch, IconX } from '@tabler/icons-react'
import { useStore } from '@/store/useStore'
import { useUser, useRegions, useAuthors } from '@/hooks/useApi'

interface FilterSidebarProps {
  totalRules: number
  filteredRules: number
  mobile?: boolean
}

export const FilterSidebar = ({ filteredRules, mobile }: FilterSidebarProps) => {
  const { filters, setFilters } = useStore()
  const { data: user } = useUser()
  const { data: regions } = useRegions()
  const { data: authors } = useAuthors(parseInt(filters.group) || 0)

  const hasActiveFilters = filters.search || filters.enabled !== 'all' || filters.author

  // Get unique authors for the dropdown
  const authorOptions = useMemo(() => {
    if (!authors) return []
    return authors.map((author) => ({
      value: author,
      label: author,
    }))
  }, [authors])

  const handleFilterChange = (key: string, value: string | null) => {
    setFilters({ [key]: value || '' })
  }

  const currentGroup = user?.groups?.find((g) => g.id.toString() === filters.group)

  const sidebarContent = (
    <Stack gap="md">
      {/* Header with count */}
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <Text size="md" fw={600}>
            Rules
          </Text>
          <Badge variant="filled" color="blue" size="md" radius="sm">
            {filteredRules}
          </Badge>
        </Group>
      </Group>

      {/* Group Selector */}
      <Box>
        <Text size="xs" fw={500} c="dimmed" mb={6} tt="uppercase">
          Group
        </Text>
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
          styles={{
            input: {
              backgroundColor: 'var(--mantine-color-dark-6)',
              borderColor: 'var(--mantine-color-dark-4)',
            },
          }}
        />
        {currentGroup && (
          <Text size="xs" c="dimmed" mt={4}>
            {currentGroup.write ? '✓ You can edit rules in this group' : 'Read-only access'}
          </Text>
        )}
      </Box>

      {/* Search */}
      <Box>
        <Text size="xs" fw={500} c="dimmed" mb={6} tt="uppercase">
          Search
        </Text>
        <TextInput
          placeholder="Name or ID..."
          size="sm"
          leftSection={<IconSearch size={14} />}
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.currentTarget.value)}
          rightSection={
            filters.search ? (
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onClick={() => handleFilterChange('search', '')}
              >
                <IconX size={12} />
              </ActionIcon>
            ) : null
          }
          styles={{
            input: {
              backgroundColor: 'var(--mantine-color-dark-6)',
              borderColor: 'var(--mantine-color-dark-4)',
            },
          }}
        />
      </Box>

      {/* Author Filter */}
      <Box>
        <Text size="xs" fw={500} c="dimmed" mb={6} tt="uppercase">
          Author
        </Text>
        <Select
          placeholder="All authors"
          size="sm"
          data={authorOptions}
          value={filters.author || null}
          onChange={(value) => handleFilterChange('author', value)}
          comboboxProps={{ withinPortal: true }}
          searchable
          clearable
          nothingFoundMessage="No authors found"
          styles={{
            input: {
              backgroundColor: 'var(--mantine-color-dark-6)',
              borderColor: 'var(--mantine-color-dark-4)',
            },
          }}
        />
      </Box>

      {/* Region - Chip group */}
      <Box>
        <Text size="xs" fw={500} c="dimmed" mb={6} tt="uppercase">
          Region
        </Text>
        <Chip.Group
          value={filters.region}
          onChange={(value) => handleFilterChange('region', value as string)}
        >
          <Group gap={6}>
            {regions?.map((region) => (
              <Chip
                key={region.name}
                value={region.name}
                size="sm"
                variant="filled"
                color="blue"
                styles={{
                  label: {
                    padding: '4px 10px',
                  },
                }}
              >
                {region.name}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
      </Box>

      {/* Status */}
      <Box>
        <Text size="xs" fw={500} c="dimmed" mb={6} tt="uppercase">
          Status
        </Text>
        <SegmentedControl
          fullWidth
          size="xs"
          value={filters.enabled}
          onChange={(value) => handleFilterChange('enabled', value)}
          data={[
            { label: 'All', value: 'all' },
            { label: 'Enabled', value: 'enabled' },
            { label: 'Disabled', value: 'disabled' },
          ]}
          styles={{
            root: {
              backgroundColor: 'var(--mantine-color-dark-6)',
            },
          }}
        />
      </Box>

      {/* Active Filters - Compact chips */}
      {hasActiveFilters && (
        <>
          <Divider />
          <Box>
            <Group gap={6} wrap="wrap">
              {filters.search && (
                <Tooltip label="Clear search">
                  <Badge
                    variant="light"
                    color="blue"
                    size="sm"
                    style={{ cursor: 'pointer' }}
                    rightSection={<IconX size={10} />}
                    onClick={() => handleFilterChange('search', '')}
                  >
                    {filters.search}
                  </Badge>
                </Tooltip>
              )}
              {filters.enabled !== 'all' && (
                <Tooltip label="Clear status filter">
                  <Badge
                    variant="light"
                    color={filters.enabled === 'enabled' ? 'green' : 'red'}
                    size="sm"
                    style={{ cursor: 'pointer' }}
                    rightSection={<IconX size={10} />}
                    onClick={() => handleFilterChange('enabled', 'all')}
                  >
                    {filters.enabled}
                  </Badge>
                </Tooltip>
              )}
              {filters.author && (
                <Tooltip label="Clear author filter">
                  <Badge
                    variant="light"
                    color="violet"
                    size="sm"
                    style={{ cursor: 'pointer' }}
                    rightSection={<IconX size={10} />}
                    onClick={() => handleFilterChange('author', '')}
                  >
                    {filters.author.split('@')[0]}
                  </Badge>
                </Tooltip>
              )}
            </Group>
          </Box>
        </>
      )}
    </Stack>
  )

  // Mobile: render as a card
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
