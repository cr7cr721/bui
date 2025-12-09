import { Modal, Table, Text, Stack, Loader, Center, Badge, Group, Alert } from '@mantine/core'
import { IconAlertCircle, IconClock } from '@tabler/icons-react'
import { useTriggers } from '@/hooks/useApi'

interface RecentTriggersModalProps {
  opened: boolean
  onClose: () => void
  ruleName: string
  ruleId: number
}

const formatTimeRemaining = (expiresTimestamp: number): string => {
  const now = Date.now()
  const expiresMs = expiresTimestamp * 1000
  const diff = expiresMs - now

  if (diff <= 0) return 'Expired'

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export const RecentTriggersModal = ({
  opened,
  onClose,
  ruleName,
  ruleId,
}: RecentTriggersModalProps) => {
  const { data: triggers, isLoading, error } = useTriggers(ruleId, opened)

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <Text fw={600}>{ruleName}</Text>
          <Badge variant="light" color="orange" size="sm">
            Active Triggers
          </Badge>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        {isLoading ? (
          <Center py="xl">
            <Stack align="center" gap="sm">
              <Loader size="md" />
              <Text size="sm" c="dimmed">
                Loading triggers...
              </Text>
            </Stack>
          </Center>
        ) : error ? (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            Failed to load triggers: {error.message}
          </Alert>
        ) : triggers && triggers.length > 0 ? (
          <Table highlightOnHover striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Entity Key</Table.Th>
                <Table.Th>Region</Table.Th>
                <Table.Th>Expires</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {triggers.map((trigger, index) => (
                <Table.Tr key={`${trigger.entity_key}-${index}`}>
                  <Table.Td>
                    <Text size="sm" ff="monospace">
                      {trigger.entity_key}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="dot" size="sm">
                      {trigger.region}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <IconClock size={14} style={{ color: 'var(--mantine-color-dimmed)' }} />
                      <Text size="sm" c="dimmed">
                        {formatTimeRemaining(trigger.expires)}
                      </Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Center py="xl">
            <Text c="dimmed">No active triggers found.</Text>
          </Center>
        )}
      </Stack>
    </Modal>
  )
}
