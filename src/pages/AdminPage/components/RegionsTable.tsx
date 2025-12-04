import { Paper, Title, Group, Table, Switch, Text } from '@mantine/core'

interface Region {
  name: string
  isDisabled: boolean
}

interface RegionsTableProps {
  regions: Region[]
  isTogglingRegion: boolean
  onToggleRegion: (region: string, isCurrentlyDisabled: boolean) => void
}

export const RegionsTable = ({ regions, isTogglingRegion, onToggleRegion }: RegionsTableProps) => {
  return (
    <Paper shadow="sm" withBorder>
      <Group
        p="md"
        justify="space-between"
        style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
      >
        <Title order={3}>Chromie Datacenters</Title>
      </Group>

      <Text p="md" c="dimmed" size="sm">
        Disabling a datacenter will cause BEAM rules to not send requests to that datacenter until
        re-enabled.
      </Text>

      <Table.ScrollContainer minWidth={400}>
        <Table highlightOnHover striped verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Group gap={4}>
                  <span style={{ fontWeight: 600 }}>Region</span>
                </Group>
              </Table.Th>
              <Table.Th>
                <Group gap={4}>
                  <span style={{ fontWeight: 600 }}>Enabled</span>
                </Group>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {regions.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={2} style={{ textAlign: 'center', padding: '2rem' }}>
                  <span style={{ color: 'var(--mantine-color-dimmed)' }}>No regions available</span>
                </Table.Td>
              </Table.Tr>
            ) : (
              regions.map((region) => (
                <Table.Tr key={region.name}>
                  <Table.Td>
                    <span style={{ fontWeight: 500 }}>{region.name}</span>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <Switch
                        checked={!region.isDisabled}
                        onChange={() => onToggleRegion(region.name, region.isDisabled)}
                        disabled={isTogglingRegion}
                        color="green"
                        size="md"
                        onLabel="On"
                        offLabel="Off"
                        styles={{
                          track: {
                            backgroundColor: region.isDisabled
                              ? 'var(--mantine-color-red-6)'
                              : undefined,
                            borderColor: region.isDisabled
                              ? 'var(--mantine-color-red-6)'
                              : undefined,
                          },
                        }}
                      />
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  )
}
