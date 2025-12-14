import { Stack, Button, Group, Card, Text } from '@mantine/core'
import { useFormContext, useFieldArray } from 'react-hook-form'
import type { RuleFormData, ActionFormData } from '@/types/rule'
import {
  DEFAULT_EMAIL_ACTION,
  DEFAULT_TELEMETRY_ACTION,
  DEFAULT_TOGGLE_ACTION,
  DEFAULT_HTTP_ACTION,
} from '@/types/rule'
import { ACTION_TYPES } from './constants'
import { ActionCard } from './ActionCard'

export const ActionsStep = () => {
  const { control } = useFormContext<RuleFormData>()
  const { fields, append, remove } = useFieldArray({ control, name: 'actions' })

  const addAction = (type: ActionFormData['type']) => {
    const defaults = {
      email: DEFAULT_EMAIL_ACTION,
      telemetry: DEFAULT_TELEMETRY_ACTION,
      toggle: DEFAULT_TOGGLE_ACTION,
      http: DEFAULT_HTTP_ACTION,
    }
    append({ ...defaults[type] })
  }

  return (
    <Stack gap="lg" mt="xl">
      <Group gap="sm">
        {ACTION_TYPES.map((t) => (
          <Button
            key={t.value}
            leftSection={<t.icon size={16} />}
            variant="light"
            color={t.color}
            onClick={() => addAction(t.value)}
          >
            Add {t.label}
          </Button>
        ))}
      </Group>
      {fields.length === 0 && (
        <Card withBorder p="xl">
          <Text c="dimmed" ta="center">
            No actions added yet. Click a button above to add an action.
          </Text>
        </Card>
      )}
      <Stack gap="md">
        {fields.map((field, index) => (
          <ActionCard key={field.id} index={index} onRemove={() => remove(index)} />
        ))}
      </Stack>
    </Stack>
  )
}
