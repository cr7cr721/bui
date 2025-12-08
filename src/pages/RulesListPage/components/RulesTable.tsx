import { Paper, Title, Group, Center, Text, Table } from '@mantine/core'
import { RulesTableHeader } from './RulesTableHeader'
import { RulesTableRow } from './RulesTableRow'
import type { Rule } from '@/types/api'

type SortField =
  | 'id'
  | 'name'
  | 'author'
  | 'group_name'
  | 'version'
  | 'created'
  | 'updated'
  | 'trigger_count'
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
    <Paper shadow="sm" withBorder>
      <Group
        p="md"
        justify="space-between"
        style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
      >
        <Title order={3}>Rules ({rules.length})</Title>
      </Group>

      {rules.length === 0 ? (
        <Center py={60}>
          <Text c="dimmed">No rules found matching your filters.</Text>
        </Center>
      ) : (
        <Table.ScrollContainer minWidth={800}>
          <Table highlightOnHover striped verticalSpacing="sm">
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
