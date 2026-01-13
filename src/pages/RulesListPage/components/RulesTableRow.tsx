import { useState } from 'react'
import { Table, Checkbox, Anchor, Badge, Text, Group, Tooltip, ActionIcon } from '@mantine/core'
import { IconAlertCircle, IconPencil, IconTransfer, IconTrash } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import type { Rule } from '@/types/api'
import { RecentTriggersModal } from './RecentTriggersModal'
import { RuleHistoryModal } from './RuleHistoryModal'

interface RulesTableRowProps {
  rule: Rule
  isSelected: boolean
  showCheckbox: boolean
  onSelect: (ruleId: number) => void
  onEdit?: (ruleId: number) => void
  onMove?: (ruleId: number) => void
  onDelete?: (ruleId: number) => void
}

export const RulesTableRow = ({
  rule,
  isSelected,
  showCheckbox,
  onSelect,
  onEdit,
  onMove,
  onDelete,
}: RulesTableRowProps) => {
  const [triggersModalOpen, setTriggersModalOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleRowClick = () => {
    setHistoryModalOpen(true)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(rule.id)
    } else {
      navigate(`/rules/${rule.id}/edit`)
    }
  }

  const handleMove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMove?.(rule.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(rule.id)
  }

  return (
    <>
      <Table.Tr
        style={{
          backgroundColor: isSelected ? 'var(--mantine-color-blue-9)' : undefined,
          cursor: 'pointer',
        }}
        onClick={handleRowClick}
      >
        {showCheckbox && (
          <Table.Td onClick={(e) => e.stopPropagation()} style={{ padding: '8px' }}>
            <Checkbox checked={isSelected} onChange={() => onSelect(rule.id)} size="sm" />
          </Table.Td>
        )}
        <Table.Td style={{ padding: '8px 12px' }}>
          <Text size="sm" c="dimmed">
            {rule.id}
          </Text>
        </Table.Td>
        <Table.Td style={{ padding: '8px 12px' }}>
          <Group gap={6} wrap="nowrap">
            <Anchor
              component={Link}
              to={`/rules/${rule.id}`}
              fw={500}
              size="sm"
              onClick={(e) => e.stopPropagation()}
            >
              {rule.name}
            </Anchor>
            {rule.trigger_count > 0 && (
              <Tooltip
                label={`${rule.trigger_count} Active throttle${rule.trigger_count > 1 ? 's' : ''}`}
              >
                <ActionIcon
                  variant="transparent"
                  color="red"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    setTriggersModalOpen(true)
                  }}
                >
                  <IconAlertCircle size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Table.Td>
        <Table.Td style={{ padding: '8px 12px' }}>
          <Text size="xs" c="dimmed" truncate style={{ maxWidth: 180 }}>
            {rule.author}
          </Text>
        </Table.Td>
        <Table.Td style={{ padding: '8px 12px' }}>
          <Group gap={4} wrap="nowrap">
            {rule.regions.map((region) => (
              <Badge
                key={region}
                size="sm"
                variant="filled"
                color={rule.enabled ? 'blue' : 'gray'}
                style={{ textTransform: 'uppercase', fontWeight: 600, fontSize: 10 }}
              >
                {region}
              </Badge>
            ))}
          </Group>
        </Table.Td>
        {showCheckbox && (
          <Table.Td style={{ padding: '8px 12px' }}>
            <Group gap={2} justify="flex-end" wrap="nowrap">
              <Tooltip label="Edit" withArrow>
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={handleEdit}>
                  <IconPencil size={15} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Move" withArrow>
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={handleMove}>
                  <IconTransfer size={15} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Delete" withArrow>
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={handleDelete}>
                  <IconTrash size={15} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Table.Td>
        )}
      </Table.Tr>

      <RecentTriggersModal
        opened={triggersModalOpen}
        onClose={() => setTriggersModalOpen(false)}
        ruleName={rule.name}
        ruleId={rule.id}
      />

      <RuleHistoryModal
        opened={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        ruleName={rule.name}
        ruleId={rule.id}
        groupName={rule.group_name}
      />
    </>
  )
}
