import { Modal, Table, Text, Stack } from '@mantine/core'

interface RecentTriggersModalProps {
  opened: boolean
  onClose: () => void
  ruleName: string
  ruleId: number
  triggerCount: number
}

export const RecentTriggersModal = ({
  opened,
  onClose,
  ruleName,
  ruleId,
  triggerCount,
}: RecentTriggersModalProps) => {
  // TODO: Fetch actual trigger data from API
  // For now, show placeholder data based on ruleId
  const mockTriggers = Array.from({ length: triggerCount }, (_, i) => ({
    throttleKey: `${ruleId}.action-${i}`,
    expires: 'in a minute',
  }))

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`${ruleName} - Recent Triggers`}
      size="lg"
      centered
    >
      <Stack gap="md">
        {mockTriggers.length > 0 ? (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Throttle Key</Table.Th>
                <Table.Th>Expires</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {mockTriggers.map((trigger, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <Text size="sm">{trigger.throttleKey}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{trigger.expires}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No recent triggers found.
          </Text>
        )}
      </Stack>
    </Modal>
  )
}
