import { Table, Checkbox, Anchor, Badge, Text, Group, Tooltip } from '@mantine/core'
import { Link } from 'react-router-dom'
import type { Rule } from '@/types/api'

interface RulesTableRowProps {
    rule: Rule
    isSelected: boolean
    showCheckbox: boolean
    onSelect: (ruleId: number) => void
}

export const RulesTableRow = ({
                                  rule,
                                  isSelected,
                                  showCheckbox,
                                  onSelect
                              }: RulesTableRowProps) => {
    return (
        <Table.Tr
            style={{
                backgroundColor: isSelected
                    ? 'var(--mantine-color-blue-9)'
                    : undefined,
            }}
        >
            {showCheckbox && (
                <Table.Td>
                    <Checkbox
                        checked={isSelected}
                        onChange={() => onSelect(rule.id)}
                    />
                </Table.Td>
            )}
            <Table.Td>
                <Anchor
                    component={Link}
                    to={`/rules/${rule.id}`}
                    fw={500}
                >
                    {rule.name}
                </Anchor>
            </Table.Td>
            <Table.Td>
                <Badge
                    color={rule.enabled ? 'green' : 'red'}
                    variant="light"
                    size="sm"
                >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Text size="sm" c="dimmed">{rule.author}</Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{rule.group_name}</Text>
            </Table.Td>
            <Table.Td>
                <Group gap={4}>
                    {rule.regions.map((region) => (
                        <Badge key={region} variant="dot" size="sm">
                            {region}
                        </Badge>
                    ))}
                </Group>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{rule.version}</Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{rule.trigger_count}</Text>
            </Table.Td>
            <Table.Td>
                <Tooltip label={new Date(rule.updated * 1000).toLocaleString()}>
                    <Text size="sm" c="dimmed">
                        {new Date(rule.updated * 1000).toLocaleDateString()}
                    </Text>
                </Tooltip>
            </Table.Td>
        </Table.Tr>
    )
}