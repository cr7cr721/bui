import { Card, Group, Text, Badge, ActionIcon, Collapse, Divider } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconTrash, IconChevronDown, IconChevronUp, IconCode } from '@tabler/icons-react'
import { useFormContext } from 'react-hook-form'
import type { RuleFormData } from '@/types/rule'
import { INPUT_TYPES } from './constants'
import { SearchInputEditor } from './SearchInputEditor'
import { HttpInputEditor } from './HttpInputEditor'
import { StaticInputEditor } from './StaticInputEditor'
import { MetricInputEditor } from './MetricInputEditor'

interface InputCardProps {
  index: number
  onRemove: () => void
}

export const InputCard = ({ index, onRemove }: InputCardProps) => {
  const { watch } = useFormContext<RuleFormData>()
  const [expanded, { toggle }] = useDisclosure(true)

  const input = watch(`inputs.${index}`)
  const inputType = INPUT_TYPES.find((t) => t.value === input?.type)
  const TypeIcon = inputType?.icon || IconCode

  return (
    <Card withBorder p="md">
      <Group justify="space-between" mb={expanded ? 'md' : 0}>
        <Group>
          <TypeIcon size={20} color={`var(--mantine-color-${inputType?.color}-6)`} />
          <Text fw={500}>
            {inputType?.label} #{index + 1}
          </Text>
          <Badge variant="light" color={inputType?.color}>
            {input?.type}
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
        {input?.type === 'search' && <SearchInputEditor index={index} />}
        {input?.type === 'http' && <HttpInputEditor index={index} />}
        {input?.type === 'static' && <StaticInputEditor index={index} />}
        {input?.type === 'metric' && <MetricInputEditor index={index} />}
      </Collapse>
    </Card>
  )
}
