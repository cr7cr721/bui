import { Table, Group, Text, Checkbox } from '@mantine/core'
import { IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react'

type SortField = 'id' | 'name' | 'author' | 'group_name' | 'created' | 'updated'
type SortDirection = 'asc' | 'desc'

interface RulesTableHeaderProps {
  showCheckbox: boolean
  allSelected: boolean
  someSelected: boolean
  sortField: SortField
  sortDirection: SortDirection
  onSelectAll: () => void
  onSort: (field: SortField) => void
}

export const RulesTableHeader = ({
  showCheckbox,
  allSelected,
  someSelected,
  sortField,
  sortDirection,
  onSelectAll,
  onSort,
}: RulesTableHeaderProps) => {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <IconSelector size={14} />
    return sortDirection === 'asc' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
  }

  const SortableHeader = ({
    field,
    label,
    width,
  }: {
    field: SortField
    label: string
    width?: number
  }) => (
    <Table.Th
      style={{ cursor: 'pointer', userSelect: 'none', width }}
      onClick={() => onSort(field)}
    >
      <Group gap={4}>
        <Text fw={600} size="sm">
          {label}
        </Text>
        {getSortIcon(field)}
      </Group>
    </Table.Th>
  )

  return (
    <Table.Thead>
      <Table.Tr>
        {showCheckbox && (
          <Table.Th style={{ width: 36, padding: '8px' }}>
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={onSelectAll}
              size="sm"
            />
          </Table.Th>
        )}
        <SortableHeader field="id" label="ID" width={70} />
        <SortableHeader field="name" label="Name" />
        <SortableHeader field="author" label="Author" />
        <Table.Th style={{ width: 140 }}>
          <Text fw={600} size="sm">
            Regions & Status
          </Text>
        </Table.Th>
        {showCheckbox && <Table.Th style={{ width: 80, textAlign: 'right', paddingRight: 16 }} />}
      </Table.Tr>
    </Table.Thead>
  )
}
