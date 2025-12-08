import { Paper, Center, Text, Table, Box, Stack } from '@mantine/core'
import { IconListSearch } from '@tabler/icons-react'
import { RulesTableHeader } from './RulesTableHeader'
import { RulesTableRow } from './RulesTableRow'
import type { Rule } from '@/types/api'

type SortField = 'id' | 'name' | 'author' | 'group_name' | 'created' | 'updated'
type SortDirection = 'asc' | 'desc'

interface RulesTableProps {
  rules: Rule[]
  selectedRuleIds: number[]
  showCheckbox: boolean
  sortField: SortField
  sortDirection: SortDirection
  onSelectAll: () => void
  onSelectRule: (ruleId: number) => void
  onSort: (field: SortField) => void
}

export const RulesTable = ({
  rules,
  selectedRuleIds,
  showCheckbox,
  sortField,
  sortDirection,
  onSelectAll,
  onSelectRule,
  onSort,
}: RulesTableProps) => {
  const allSelected = rules.length > 0 && selectedRuleIds.length === rules.length
  const someSelected = selectedRuleIds.length > 0 && selectedRuleIds.length < rules.length

  return (
    <Paper
      shadow="sm"
      withBorder
      style={{
        backgroundColor: 'var(--mantine-color-dark-7)',
        borderColor: 'var(--mantine-color-dark-5)',
        overflow: 'hidden',
      }}
    >
      {rules.length === 0 ? (
        <Center py={80}>
          <Stack align="center" gap="md">
            <Box
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'var(--mantine-color-dark-6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconListSearch size={32} style={{ color: 'var(--mantine-color-dimmed)' }} />
            </Box>
            <Text c="dimmed" ta="center">
              No rules found matching your filters.
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Try adjusting your search or filter criteria.
            </Text>
          </Stack>
        </Center>
      ) : (
        <Table.ScrollContainer minWidth={800}>
          <Table
            highlightOnHover
            striped
            verticalSpacing="sm"
            styles={{
              table: {
                borderCollapse: 'collapse',
              },
              thead: {
                backgroundColor: 'var(--mantine-color-dark-6)',
              },
              tr: {
                borderBottom: '1px solid var(--mantine-color-dark-5)',
              },
            }}
          >
            <RulesTableHeader
              showCheckbox={showCheckbox}
              allSelected={allSelected}
              someSelected={someSelected}
              sortField={sortField}
              sortDirection={sortDirection}
              onSelectAll={onSelectAll}
              onSort={onSort}
            />
            <Table.Tbody>
              {rules.map((rule) => (
                <RulesTableRow
                  key={rule.id}
                  rule={rule}
                  isSelected={selectedRuleIds.includes(rule.id)}
                  showCheckbox={showCheckbox}
                  onSelect={onSelectRule}
                />
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Paper>
  )
}
