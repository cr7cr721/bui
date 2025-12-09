import { useMemo } from 'react'
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
  SegmentedControl,
  ActionIcon,
  Tooltip,
} from '@mantine/core'
import { IconSearch, IconX, IconRefresh } from '@tabler/icons-react'
import { useStore } from '@/store/useStore'
import { useUser, useRegions, useAuthors } from '@/hooks/useApi'

interface FilterSidebarProps {
  totalRules: number
  filteredRules: number
  mobile?: boolean
}

export const FilterSidebar = ({ totalRules, filteredRules, mobile }: FilterSidebarProps) => {
  const { filters, setFilters, resetFilters } = useStore()
  const { data: user } = useUser()
  const { data: regions } = useRegions()
  const { data: authors } = useAuthors(parseInt(filters.group) || 0)

  const hasActiveFilters = filters.search || filters.enabled !== 'all' || filters.author
  const isFiltered = filteredRules !== totalRules

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

  const handleReset = () => {
    resetFilters()
  }

  const currentGroup = user?.groups?.find((g) => g.id.toString() === filters.group)

  const sidebarContent = (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <Text size="lg" fw={600}>
            Rules
          </Text>
          <Badge
            variant={isFiltered ? 'filled' : 'light'}
            color={isFiltered ? 'blue' : 'gray'}
            size="lg"
            radius="sm"
          >
            {filteredRules}
          </Badge>
        </Group>
        {hasActiveFilters && (
          <Tooltip label="Reset filters">
            <ActionIcon variant="subtle" color="gray" onClick={handleReset}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      <Divider />

      {/* Group Selector - Primary filter */}
      <Box>
        <Text size="xs" fw={600} c="dimmed" mb={8} tt="uppercase" lts={0.5}>
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
              fontWeight: 500,
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
        <Text size="xs" fw={600} c="dimmed" mb={8} tt="uppercase" lts={0.5}>
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
        <Text size="xs" fw={600} c="dimmed" mb={8} tt="uppercase" lts={0.5}>
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

      {/* Region - Radio buttons */}
      <Box>
        <Text size="xs" fw={600} c="dimmed" mb={8} tt="uppercase" lts={0.5}>
          Region
        </Text>
        <Stack gap={4}>
          {regions?.map((region) => (
            <Box
              key={region.name}
              p="xs"
              style={{
                borderRadius: 'var(--mantine-radius-sm)',
                backgroundColor:
                  filters.region === region.name ? 'var(--mantine-color-blue-9)' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onClick={() => handleFilterChange('region', region.name)}
            >
              <Group gap="xs" wrap="nowrap">
                <Box
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: `2px solid ${
                      filters.region === region.name
                        ? 'var(--mantine-color-blue-5)'
                        : 'var(--mantine-color-dark-4)'
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {filters.region === region.name && (
                    <Box
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'var(--mantine-color-blue-5)',
                      }}
                    />
                  )}
                </Box>
                <Text size="sm" fw={filters.region === region.name ? 500 : 400}>
                  {region.name}
                </Text>
              </Group>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Status - Segmented Control */}
      <Box>
        <Text size="xs" fw={600} c="dimmed" mb={8} tt="uppercase" lts={0.5}>
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

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <>
          <Divider />
          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.5}>
                Active Filters
              </Text>
              <Button variant="subtle" color="gray" size="compact-xs" onClick={handleReset}>
                Clear all
              </Button>
            </Group>
            <Group gap={6}>
              {filters.search && (
                <Badge
                  variant="light"
                  color="blue"
                  size="sm"
                  rightSection={
                    <ActionIcon
                      size="xs"
                      variant="transparent"
                      color="blue"
                      onClick={() => handleFilterChange('search', '')}
                    >
                      <IconX size={10} />
                    </ActionIcon>
                  }
                  styles={{ root: { paddingRight: 4 } }}
                >
                  "{filters.search}"
                </Badge>
              )}
              {filters.enabled !== 'all' && (
                <Badge
                  variant="light"
                  color={filters.enabled === 'enabled' ? 'green' : 'red'}
                  size="sm"
                  rightSection={
                    <ActionIcon
                      size="xs"
                      variant="transparent"
                      color={filters.enabled === 'enabled' ? 'green' : 'red'}
                      onClick={() => handleFilterChange('enabled', 'all')}
                    >
                      <IconX size={10} />
                    </ActionIcon>
                  }
                  styles={{ root: { paddingRight: 4 } }}
                >
                  {filters.enabled}
                </Badge>
              )}
              {filters.author && (
                <Badge
                  variant="light"
                  color="violet"
                  size="sm"
                  rightSection={
                    <ActionIcon
                      size="xs"
                      variant="transparent"
                      color="violet"
                      onClick={() => handleFilterChange('author', '')}
                    >
                      <IconX size={10} />
                    </ActionIcon>
                  }
                  styles={{ root: { paddingRight: 4 } }}
                >
                  {filters.author.split('@')[0]}
                </Badge>
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
      p="lg"
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
