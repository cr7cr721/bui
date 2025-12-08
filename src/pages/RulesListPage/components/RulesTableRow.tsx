import { useState } from 'react'
import { Table, Checkbox, Anchor, Badge, Text, Group, Tooltip, ActionIcon } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import type { Rule } from '@/types/api'
import { RecentTriggersModal } from './RecentTriggersModal'

interface RulesTableRowProps {
  rule: Rule
  isSelected: boolean
  showCheckbox: boolean
  onSelect: (ruleId: number) => void
}

export const RulesTableRow = ({ rule, isSelected, showCheckbox, onSelect }: RulesTableRowProps) => {
  const [triggersModalOpen, setTriggersModalOpen] = useState(false)

  return (
    <>
      <Table.Tr
        style={{
          backgroundColor: isSelected ? 'var(--mantine-color-blue-9)' : undefined,
        }}
      >
        {showCheckbox && (
          <Table.Td>
            <Checkbox checked={isSelected} onChange={() => onSelect(rule.id)} />
          </Table.Td>
        )}
        <Table.Td>
          <Text size="sm" c="dimmed">
            {rule.id}
          </Text>
        </Table.Td>
        <Table.Td>
          <Group gap="xs" wrap="nowrap">
            <Anchor component={Link} to={`/rules/${rule.id}`} fw={500}>
              {rule.name}
            </Anchor>
            {rule.trigger_count > 0 && (
              <Tooltip
                label={`${rule.trigger_count} Active throttle${rule.trigger_count > 1 ? 's' : ''}`}
              >
                <ActionIcon
                  variant="transparent"
                  color="red"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setTriggersModalOpen(true)
                  }}
                >
                  <IconAlertCircle size={18} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Table.Td>
        <Table.Td>
          <Badge color={rule.enabled ? 'green' : 'red'} variant="light" size="sm">
            {rule.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text size="sm" c="dimmed">
            {rule.author}
          </Text>
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
          <Tooltip label={new Date(rule.updated * 1000).toLocaleString()}>
            <Text size="sm" c="dimmed">
              {new Date(rule.updated * 1000).toLocaleDateString()}
            </Text>
          </Tooltip>
        </Table.Td>
      </Table.Tr>

      <RecentTriggersModal
        opened={triggersModalOpen}
        onClose={() => setTriggersModalOpen(false)}
        ruleName={rule.name}
        ruleId={rule.id}
        triggerCount={rule.trigger_count}
      />
    </>
  )
}
