import { Stack, Button, Group, Card, Text } from '@mantine/core'
import { useFormContext, useFieldArray } from 'react-hook-form'
import type { RuleFormData, InputFormData } from '@/types/rule'
import {
  DEFAULT_SEARCH_INPUT,
  DEFAULT_HTTP_INPUT,
  DEFAULT_STATIC_INPUT,
  DEFAULT_METRIC_INPUT,
} from '@/types/rule'
import { INPUT_TYPES } from './constants'
import { InputCard } from './InputCard'

export const InputsStep = () => {
  const { control } = useFormContext<RuleFormData>()
  const { fields, append, remove } = useFieldArray({ control, name: 'inputs' })

  const addInput = (type: InputFormData['type']) => {
    const defaults = {
      search: DEFAULT_SEARCH_INPUT,
      http: DEFAULT_HTTP_INPUT,
      static: DEFAULT_STATIC_INPUT,
      metric: DEFAULT_METRIC_INPUT,
    }
    append({ ...defaults[type] })
  }

  return (
    <Stack gap="lg" mt="xl">
      <Group gap="sm">
        {INPUT_TYPES.map((t) => (
          <Button
            key={t.value}
            leftSection={<t.icon size={16} />}
            variant="light"
            color={t.color}
            onClick={() => addInput(t.value)}
          >
            Add {t.label}
          </Button>
        ))}
      </Group>
      {fields.length === 0 && (
        <Card withBorder p="xl">
          <Text c="dimmed" ta="center">
            No inputs added yet. Click a button above to add an input.
          </Text>
        </Card>
      )}
      <Stack gap="md">
        {fields.map((field, index) => (
          <InputCard key={field.id} index={index} onRemove={() => remove(index)} />
        ))}
      </Stack>
    </Stack>
  )
}
