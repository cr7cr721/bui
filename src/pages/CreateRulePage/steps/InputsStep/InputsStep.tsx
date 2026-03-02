import { Stack, Button, Group, Card, Text, Switch, Grid, Paper } from '@mantine/core'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'
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
  const { control, watch } = useFormContext<RuleFormData>()
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

      {hasSearchInputs && (
        <Controller
          name={'esUpgraded' as keyof RuleFormData}
          control={control}
          render={({ field }) => (
            <Paper withBorder p="sm" bg="dark.7">
              <Switch
                label="Use Elasticsearch 7"
                description="Enable this flag if your search inputs use Elasticsearch 7 syntax"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.currentTarget.checked)}
              />
            </Paper>
          )}
        />
      )}

      {fields.length === 0 && (
        <Card withBorder p="xl">
          <Text c="dimmed" ta="center">
            No inputs added yet. Click a button above to add an input.
          </Text>
        </Card>
      )}

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: fields.length > 0 ? 8 : 12 }}>
          <Stack gap="md">
            {fields.map((field, index) => (
              <InputCard key={field.id} index={index} onRemove={() => remove(index)} />
            ))}
          </Stack>
        </Grid.Col>

        {fields.length > 0 && (
          <Grid.Col span={{ base: 12, md: 4 }}>
            <RuntimeContextExplorer
              stopStep="inputs-execute"
              rootName="inputs"
              expandLevel={4}
              ctxSelector={(ctx) => ctx.inputs}
              height={450}
            />
          </Grid.Col>
        )}
      </Grid>
    </Stack>
  )
}
