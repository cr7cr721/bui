import { Stack, TextInput, Select, Text, Paper, Grid } from '@mantine/core'
import { useFormContext, Controller } from 'react-hook-form'
import Editor from '@monaco-editor/react'
import type { RuleFormData } from '@/types/rule'
import type { ActionEditorProps } from './constants'

export const EmailActionEditor = ({ index }: ActionEditorProps) => {
  const { register, control, watch } = useFormContext<RuleFormData>()
  const format = watch(`actions.${index}.format` as const)

  return (
    <Stack gap="md">
      <TextInput
        label="Subject"
        placeholder="Alert: ${context.ruleName}"
        {...register(`actions.${index}.subject` as const)}
      />
      <Grid>
        <Grid.Col span={6}>
          <TextInput
            label="To"
            description="Comma separated"
            placeholder="user@blizzard.com"
            {...register(`actions.${index}.to` as const)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="BCC"
            description="Optional"
            placeholder="manager@blizzard.com"
            {...register(`actions.${index}.bcc` as const)}
          />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col span={6}>
          <Controller
            name={`actions.${index}.format` as const}
            control={control}
            render={({ field }) => (
              <Select
                label="Format"
                data={[
                  { value: 'text', label: 'Text' },
                  { value: 'html', label: 'HTML' },
                  { value: 'markdown', label: 'Markdown' },
                ]}
                {...field}
                value={field.value as string}
              />
            )}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Controller
            name={`actions.${index}.templateType` as const}
            control={control}
            render={({ field }) => (
              <Select
                label="Template Type"
                data={[
                  { value: 'text', label: 'ES6 Template' },
                  { value: 'handlebars', label: 'Handlebars' },
                ]}
                {...field}
                value={field.value as string}
              />
            )}
          />
        </Grid.Col>
      </Grid>
      <div>
        <Text size="sm" fw={500} mb="xs">
          Body
        </Text>
        <Controller
          name={`actions.${index}.body` as const}
          control={control}
          render={({ field }) => (
            <Paper withBorder style={{ overflow: 'hidden' }}>
              <Editor
                height="300px"
                language={format === 'html' ? 'html' : 'handlebars'}
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
    </Stack>
  )
}
