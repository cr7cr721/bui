import {
  Modal,
  Table,
  Text,
  Stack,
  Loader,
  Center,
  Badge,
  Group,
  Alert,
  Anchor,
  ScrollArea,
} from '@mantine/core'
import { IconAlertCircle, IconHistory } from '@tabler/icons-react'
import { useRuleHistory } from '@/hooks/useApi'
import { Link } from 'react-router-dom'
import type { RuleHistoryEntry } from '@/types/api'

interface RuleHistoryModalProps {
  opened: boolean
  onClose: () => void
  ruleName: string
  ruleId: number
  groupName: string
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'numeric',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

const getActionBadgeColor = (action: RuleHistoryEntry['action']): string => {
  switch (action) {
    case 'update':
      return 'blue'
    case 'enable':
      return 'green'
    case 'disable':
      return 'red'
    case 'move':
      return 'orange'
    case 'create':
      return 'teal'
    case 'delete':
      return 'gray'
    default:
      return 'gray'
  }
}

export const RuleHistoryModal = ({
  opened,
  onClose,
  ruleName,
  ruleId,
  groupName,
}: RuleHistoryModalProps) => {
  const { data: history, isLoading, error } = useRuleHistory(ruleId, opened)

  // Filter out svcBEAM update actions like the old app
  const filteredHistory = history?.filter(
    (entry) => !(entry.username === 'svcBEAM' && entry.action === 'update')
  )

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconHistory size={20} />
          <Text fw={600}>{ruleName}</Text>
        </Group>
      }
      size="xl"
      centered
    >
      <Stack gap="md">
        {/* BEAM Group Info */}
        <div>
          <Text size="sm" fw={500} c="dimmed">
            BEAM Group
          </Text>
          <Text fw={600}>{groupName}</Text>
        </div>

        {/* Rule History */}
        <div>
          <Text size="sm" fw={500} c="dimmed" mb="xs">
            Rule History
          </Text>

          {isLoading ? (
            <Center py="xl">
              <Stack align="center" gap="sm">
                <Loader size="md" />
                <Text size="sm" c="dimmed">
                  Loading history...
                </Text>
              </Stack>
            </Center>
          ) : error ? (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
              Failed to load history: {error.message}
            </Alert>
          ) : filteredHistory && filteredHistory.length > 0 ? (
            <ScrollArea h={300}>
              <Table highlightOnHover striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Region</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>User</Table.Th>
                    <Table.Th>Action</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Version</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}></Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredHistory.map((entry, index) => (
                    <Table.Tr key={`${entry.date}-${index}`}>
                      <Table.Td>
                        <Badge variant="light" size="sm">
                          {entry.region}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{formatDate(entry.date)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{entry.username}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getActionBadgeColor(entry.action)} variant="light" size="sm">
                          {entry.action}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Text size="sm">{entry.version ?? '-'}</Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        {entry.version && entry.version > 1 && (
                          <Anchor
                            component={Link}
                            to={`/rules/${ruleId}?version=${entry.version}&compare=${entry.version - 1}`}
                            size="sm"
                            onClick={onClose}
                          >
                            View Changes
                          </Anchor>
                        )}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        {entry.version != null && (
                          <Anchor
                            component={Link}
                            to={`/rules/${ruleId}?version=${entry.version}`}
                            size="sm"
                            onClick={onClose}
                          >
                            Load
                          </Anchor>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          ) : (
            <Center py="xl">
              <Text c="dimmed">No history found for this rule.</Text>
            </Center>
          )}
        </div>
      </Stack>
    </Modal>
  )
}
