import { Stack, TextInput, Select, Text, Paper, Grid } from '@mantine/core'
import { useFormContext, Controller } from 'react-hook-form'
import Editor from '@monaco-editor/react'
import type { RuleFormData } from '@/types/rule'
import type { ActionEditorProps } from './constants'

export const TelemetryActionEditor = ({ index }: ActionEditorProps) => {
  const { register, control } = useFormContext<RuleFormData>()

  return (
    <Stack gap="md">
      <TextInput
        label="Summary"
        placeholder="Alert summary"
        {...register(`actions.${index}.summary` as const)}
      />
      <div>
        <Text size="sm" fw={500} mb="xs">
          Description
        </Text>
        <Controller
          name={`actions.${index}.description` as const}
          control={control}
          render={({ field }) => (
            <Paper withBorder style={{ overflow: 'hidden' }}>
              <Editor
                height="200px"
                language="handlebars"
                theme="vs-dark"
                value={field.value as string}
                onChange={(v) => field.onChange(v || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  automaticLayout: true,
                  wordWrap: 'on',
                }}
              />
            </Paper>
          )}
        />
      </div>
      <Grid>
        <Grid.Col span={4}>
          <TextInput
            label="Qualifier"
            placeholder="Optional"
            {...register(`actions.${index}.qualifier` as const)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <TextInput
            label="Condition ID"
            placeholder="Optional"
            {...register(`actions.${index}.conditionId` as const)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Controller
            name={`actions.${index}.severity` as const}
            control={control}
            render={({ field }) => (
              <Select
                label="Severity"
                data={[
                  { value: '1', label: '1 - Info' },
                  { value: '2', label: '2 - Warning' },
                  { value: '3', label: '3 - Minor' },
                  { value: '4', label: '4 - Major' },
                  { value: '5', label: '5 - Critical' },
                ]}
                value={String(field.value)}
                onChange={(v) => field.onChange(parseInt(v || '4'))}
              />
            )}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  )
}
