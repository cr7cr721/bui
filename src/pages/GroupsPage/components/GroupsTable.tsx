import { Paper, Title, Group, Table, Badge, Button } from '@mantine/core'
import { IconEdit } from '@tabler/icons-react'
import type { Group as GroupType } from '@/types/api'

interface GroupsTableProps {
    groups: GroupType[]
    isAdmin: boolean
    onEdit: (group: GroupType) => void
}

export const GroupsTable = ({ groups, isAdmin, onEdit }: GroupsTableProps) => {
    return (
        <Paper shadow="sm" withBorder>
            <Group p="md" justify="space-between" style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
                <Title order={3}>Groups</Title>
            </Group>

            <Table.ScrollContainer minWidth={600}>
                <Table highlightOnHover striped verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Full name</Table.Th>
                            <Table.Th>CN LDAP group</Table.Th>
                            <Table.Th style={{ width: 200 }}>Access</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {groups.map((group) => (
                            <Table.Tr key={group.id}>
                                <Table.Td>{group.fullname}</Table.Td>
                                <Table.Td>{group.ad_group || '-'}</Table.Td>
                                <Table.Td>
                                    <Group gap="sm">
                                        {group.write && (
                                            <Badge color="green" variant="light" size="sm">
                                                Save Rules
                                            </Badge>
                                        )}
                                        {isAdmin && (
                                            <Button
                                                variant="light"
                                                size="xs"
                                                leftSection={<IconEdit size={14} />}
                                                onClick={() => onEdit(group)}
                                            >
                                                Edit Group
                                            </Button>
                                        )}
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>
        </Paper>
    )
}