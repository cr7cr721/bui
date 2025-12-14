import { Stack, TextInput, Text, Paper } from '@mantine/core'
import { useFormContext, Controller } from 'react-hook-form'
import Editor from '@monaco-editor/react'
import type { RuleFormData } from '@/types/rule'
import type { InputEditorProps } from './constants'

export const SearchInputEditor = ({ index }: InputEditorProps) => {
  const { register, control } = useFormContext<RuleFormData>()

  return (
    <Stack gap="md">
      <TextInput
        label="Search Index"
        placeholder="all-telemetry-v2-*"
        description="Elasticsearch index pattern to search"
        {...register(`inputs.${index}.index` as const)}
      />
      <div>
        <Text size="sm" fw={500} mb="xs">
          Search Body (JSON)
        </Text>
        <Controller
          name={`inputs.${index}.searchBody` as const}
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
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </Paper>
          )}
        />
      </div>
    </Stack>
  )
}
