import { Stack, Button, Group, Card, Text, Grid, Switch } from '@mantine/core'
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
import { RuntimeContextExplorer } from '../../components/RuntimeContextExplorer'

export const InputsStep = () => {
  const { control, watch, setValue } = useFormContext<RuleFormData>()
  const { fields, append, remove } = useFieldArray({ control, name: 'inputs' })

  const inputs = watch('inputs')
  const hasSearchInputs = inputs?.some((i) => i.type === 'search')

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
    <Grid mt="xl" gutter="md">
      <Grid.Col span={8}>
        <Stack gap="lg">
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

          {hasSearchInputs && (
            <Switch
              label="Use Elasticsearch 7 (es_upgraded)"
              checked={watch('esUpgraded') || false}
              onChange={(e) => setValue('esUpgraded', e.currentTarget.checked)}
            />
          )}

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
      </Grid.Col>
      <Grid.Col span={4}>
        <RuntimeContextExplorer
          stopStep="inputs-execute"
          rootName="ctx.inputs"
          expandLevel={4}
          ctxSelector={(ctx) => ctx.inputs}
        />
      </Grid.Col>
    </Grid>
  )
}
