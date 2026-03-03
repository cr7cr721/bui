import { Stack, TextInput, Select, Text, Paper, Group } from '@mantine/core'
import { useFormContext, Controller } from 'react-hook-form'
import Editor from '@monaco-editor/react'
import type { RuleFormData } from '@/types/rule'
import type { InputEditorProps } from './constants'
import { MetricChart } from '../../components/MetricChart'

export const MetricInputEditor = ({ index }: InputEditorProps) => {
  const { register, control } = useFormContext<RuleFormData>()

  return (
    <Stack gap="md">
      <TextInput
        label="Program Name"
        placeholder="gdp_cost"
        {...register(`inputs.${index}.programName` as const)}
      />
      <TextInput
        label="Metric Name"
        placeholder="my.metric.name"
        {...register(`inputs.${index}.metricName` as const)}
      />
      <Group grow>
        <TextInput
          label="Start Relative Value"
          placeholder="10"
          {...register(`inputs.${index}.startValue` as const)}
        />
        <Controller
          name={`inputs.${index}.startUnit` as const}
          control={control}
          render={({ field }) => (
            <Select
              label="Unit"
              data={[
                'milliseconds',
                'seconds',
                'minutes',
                'hours',
                'days',
                'weeks',
                'months',
                'years',
              ]}
              {...field}
              value={field.value as string}
            />
          )}
        />
      </Group>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Tags (JSON)
        </Text>
        <Controller
          name={`inputs.${index}.tags` as const}
          control={control}
          render={({ field }) => (
            <Paper withBorder style={{ overflow: 'hidden' }}>
              <Editor
                height="80px"
                language="json"
                theme="vs-dark"
                value={field.value as string}
                onChange={(v) => field.onChange(v || '{}')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'off',
                  automaticLayout: true,
                }}
              />
            </Paper>
          )}
        />
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Group By (JSON)
        </Text>
        <Controller
          name={`inputs.${index}.groupBy` as const}
          control={control}
          render={({ field }) => (
            <Paper withBorder style={{ overflow: 'hidden' }}>
              <Editor
                height="80px"
                language="json"
                theme="vs-dark"
                value={field.value as string}
                onChange={(v) => field.onChange(v || '[]')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'off',
                  automaticLayout: true,
                }}
              />
            </Paper>
          )}
        />
      </div>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Aggregators (JSON)
        </Text>
        <Controller
          name={`inputs.${index}.aggregators` as const}
          control={control}
          render={({ field }) => (
            <Paper withBorder style={{ overflow: 'hidden' }}>
              <Editor
                height="80px"
                language="json"
                theme="vs-dark"
                value={field.value as string}
                onChange={(v) => field.onChange(v || '[]')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'off',
                  automaticLayout: true,
                }}
              />
            </Paper>
          )}
        />
      </div>

      {/* Metric Chart Preview */}
      <MetricChart inputIndex={index} />
    </Stack>
  )
}
