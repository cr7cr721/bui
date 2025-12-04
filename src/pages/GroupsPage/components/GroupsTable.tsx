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
      <Group
        p="md"
        justify="space-between"
        style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
      >
        <Title order={3}>Groups ({groups.length})</Title>
      </Group>

      <Table.ScrollContainer minWidth={600}>
        <Table highlightOnHover striped verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Group gap={4}>
                  <span style={{ fontWeight: 600 }}>Full name</span>
                </Group>
              </Table.Th>
              <Table.Th>
                <Group gap={4}>
                  <span style={{ fontWeight: 600 }}>CN LDAP group</span>
                </Group>
              </Table.Th>
              <Table.Th style={{ width: 250 }}>
                <Group gap={4}>
                  <span style={{ fontWeight: 600 }}>Access</span>
                </Group>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {groups.map((group) => (
              <Table.Tr key={group.id}>
                <Table.Td>
                  <span style={{ fontWeight: 500 }}>{group.fullname}</span>
                </Table.Td>
                <Table.Td>
                  <span style={{ color: 'var(--mantine-color-dimmed)' }}>
                    {group.ad_group || '-'}
                  </span>
                </Table.Td>
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
                        color="blue"
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
