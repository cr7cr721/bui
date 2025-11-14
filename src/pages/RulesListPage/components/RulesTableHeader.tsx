import { Table, Group, Text, Checkbox } from '@mantine/core'
import { IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react'

type SortField = 'name' | 'author' | 'group_name' | 'version' | 'created' | 'updated' | 'trigger_count'
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
                                     onSort
                                 }: RulesTableHeaderProps) => {
    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <IconSelector size={14} />
        return sortDirection === 'asc'
            ? <IconChevronUp size={14} />
            : <IconChevronDown size={14} />
    }

    const SortableHeader = ({ field, label, width }: { field: SortField; label: string; width?: number }) => (
        <Table.Th
            style={{ cursor: 'pointer', userSelect: 'none', width }}
            onClick={() => onSort(field)}
        >
            <Group gap={4}>
                <Text fw={600}>{label}</Text>
                {getSortIcon(field)}
            </Group>
        </Table.Th>
    )

    return (
        <Table.Thead>
            <Table.Tr>
                {showCheckbox && (
                    <Table.Th style={{ width: 40 }}>
                        <Checkbox
                            checked={allSelected}
                            indeterminate={someSelected}
                            onChange={onSelectAll}
                        />
                    </Table.Th>
                )}
                <SortableHeader field="name" label="Name" />
                <Table.Th style={{ width: 100 }}>Status</Table.Th>
                <SortableHeader field="author" label="Author" />
                <SortableHeader field="group_name" label="Group" />
                <Table.Th>Regions</Table.Th>
                <SortableHeader field="version" label="Ver" width={80} />
                <SortableHeader field="trigger_count" label="Triggers" />
                <SortableHeader field="updated" label="Updated" />
            </Table.Tr>
        </Table.Thead>
    )
}