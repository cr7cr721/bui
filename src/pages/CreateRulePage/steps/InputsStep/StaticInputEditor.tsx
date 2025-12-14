import { Stack, Text, Paper } from '@mantine/core'
import { useFormContext, Controller } from 'react-hook-form'
import Editor from '@monaco-editor/react'
import type { RuleFormData } from '@/types/rule'
import type { InputEditorProps } from './constants'

export const StaticInputEditor = ({ index }: InputEditorProps) => {
  const { control } = useFormContext<RuleFormData>()

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Define static JSON data that will be available to your rule.
      </Text>
      <Controller
        name={`inputs.${index}.json` as const}
        control={control}
        render={({ field }) => (
          <Paper withBorder style={{ overflow: 'hidden' }}>
            <Editor
              height="300px"
              language="json"
              theme="vs-dark"
              value={field.value as string}
              onChange={(value) => field.onChange(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </Paper>
        )}
      />
    </Stack>
  )
}
