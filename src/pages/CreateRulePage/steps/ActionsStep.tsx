import { Stack, Button, Group, Card, Text, Badge } from '@mantine/core'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { IconTrash, IconMail, IconBell, IconPower, IconWorld } from '@tabler/icons-react'
import type { RuleFormData } from '@/types/rule'

const ACTION_TYPES = [
  { value: 'email', label: 'Email Action', icon: IconMail },
  { value: 'telemetry', label: 'Telemetry Alert', icon: IconBell },
  { value: 'toggle', label: 'Toggle Rule', icon: IconPower },
  { value: 'http', label: 'HTTP Request', icon: IconWorld },
]

export const ActionsStep = () => {
  const { control } = useFormContext<RuleFormData>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actions',
  })

  const addAction = (type: 'email' | 'telemetry' | 'toggle' | 'http') => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    append({ type, config: {} })
  }

  return (
    <Stack gap="lg" mt="xl">
      <Group gap="sm">
        <Button
          leftSection={<IconMail size={16} />}
          variant="light"
          onClick={() => addAction('email')}
        >
          Add Email Action
        </Button>
        <Button
          leftSection={<IconBell size={16} />}
          variant="light"
          onClick={() => addAction('telemetry')}
        >
          Add Telemetry Alert
        </Button>
        <Button
          leftSection={<IconPower size={16} />}
          variant="light"
          onClick={() => addAction('toggle')}
        >
          Add Toggle Rule
        </Button>
        <Button
          leftSection={<IconWorld size={16} />}
          variant="light"
          onClick={() => addAction('http')}
        >
          Add HTTP Request
        </Button>
      </Group>

      {fields.length === 0 && (
        <Card withBorder p="xl">
          <Text c="dimmed" ta="center">
            No actions added yet. Click a button above to add an action.
          </Text>
        </Card>
      )}

      <Stack gap="md">
        {fields.map((field, index) => {
          const ActionIcon = ACTION_TYPES.find((t) => t.value === field.type)?.icon || IconBell

          return (
            <Card key={field.id} withBorder p="md">
              <Group justify="space-between" mb="md">
                <Group>
                  <ActionIcon size={20} />
                  <Text fw={500}>{ACTION_TYPES.find((t) => t.value === field.type)?.label}</Text>
                  <Badge variant="light" color="green">
                    {field.type}
                  </Badge>
                </Group>
                <Button color="red" variant="subtle" size="xs" onClick={() => remove(index)}>
                  <IconTrash size={16} />
                </Button>
              </Group>

              {/* TODO: Add specific configuration fields based on action type */}
              <Text size="sm" c="dimmed">
                Configuration options for {field.type} action will appear here
              </Text>
            </Card>
          )
        })}
      </Stack>
    </Stack>
  )
}
