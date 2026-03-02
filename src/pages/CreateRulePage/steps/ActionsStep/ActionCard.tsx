import { Card, Group, Text, Badge, ActionIcon, Collapse, Divider } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconTrash, IconChevronDown, IconChevronUp, IconBell } from '@tabler/icons-react'
import { useFormContext } from 'react-hook-form'
import type { RuleFormData } from '@/types/rule'
import { ACTION_TYPES } from './constants'
import { EmailActionEditor } from './EmailActionEditor'
import { TelemetryActionEditor } from './TelemetryActionEditor'
import { ToggleActionEditor } from './ToggleActionEditor'
import { HttpActionEditor } from './HttpActionEditor'
import { ThrottleConfig } from './ThrottleConfig'
import { ActionIfCondition } from './ActionIfCondition'
import { ActionPreview } from './ActionPreview'

interface ActionCardProps {
  index: number
  onRemove: () => void
}

export const ActionCard = ({ index, onRemove }: ActionCardProps) => {
  const { watch } = useFormContext<RuleFormData>()
  const [expanded, { toggle }] = useDisclosure(true)

  const action = watch(`actions.${index}`)
  const actionType = ACTION_TYPES.find((t) => t.value === action?.type)
  const TypeIcon = actionType?.icon || IconBell

  return (
    <Card withBorder p="md">
      <Group justify="space-between" mb={expanded ? 'md' : 0}>
        <Group>
          <TypeIcon size={20} color={`var(--mantine-color-${actionType?.color}-6)`} />
          <Text fw={500}>
            {actionType?.label} #{index + 1}
          </Text>
          <Badge variant="light" color={actionType?.color}>
            {action?.type}
          </Badge>
        </Group>
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={toggle}>
            {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </ActionIcon>
          <ActionIcon color="red" variant="subtle" onClick={onRemove}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>
      <Collapse in={expanded}>
        <Divider mb="md" />
        {action?.type === 'email' && <EmailActionEditor index={index} />}
        {action?.type === 'telemetry' && <TelemetryActionEditor index={index} />}
        {action?.type === 'toggle' && <ToggleActionEditor index={index} />}
        {action?.type === 'http' && <HttpActionEditor index={index} />}
        <ThrottleConfig index={index} />
        <ActionIfCondition index={index} />
        {(action?.type === 'email' || action?.type === 'telemetry') && (
          <ActionPreview index={index} />
        )}
      </Collapse>
    </Card>
  )
}
