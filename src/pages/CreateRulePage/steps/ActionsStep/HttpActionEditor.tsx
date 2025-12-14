import { Stack, TextInput, Select, Switch, Text, Paper, Group } from '@mantine/core'
import { useFormContext, Controller } from 'react-hook-form'
import Editor from '@monaco-editor/react'
import type { RuleFormData } from '@/types/rule'
import type { ActionEditorProps } from './constants'

export const HttpActionEditor = ({ index }: ActionEditorProps) => {
  const { register, control, watch } = useFormContext<RuleFormData>()
  const method = watch(`actions.${index}.method` as const)
  const isJson = watch(`actions.${index}.isJson` as const)

  return (
    <Stack gap="md">
      <Paper p="sm" bg="yellow.9" withBorder>
        <Text size="sm" c="yellow.1">
          ⚠️ HTTP requests require access restrictions to be lifted.
        </Text>
      </Paper>
      <Group grow>
        <TextInput
          label="URL"
          placeholder="https://api.example.com/webhook"
          {...register(`actions.${index}.url` as const)}
        />
        <Controller
          name={`actions.${index}.method` as const}
          control={control}
          render={({ field }) => (
            <Select
              label="Method"
              data={['GET', 'POST', 'PUT']}
              {...field}
              value={field.value as string}
            />
          )}
        />
      </Group>
      <Controller
        name={`actions.${index}.isJson` as const}
        control={control}
        render={({ field }) => (
          <Switch
            label="Send / Receive as JSON"
            checked={field.value as boolean}
            onChange={(e) => field.onChange(e.currentTarget.checked)}
          />
        )}
      />
      {method !== 'GET' && (
        <div>
          <Text size="sm" fw={500} mb="xs">
            Request Body
          </Text>
          <Controller
            name={`actions.${index}.body` as const}
            control={control}
            render={({ field }) => (
              <Paper withBorder style={{ overflow: 'hidden' }}>
                <Editor
                  height="200px"
                  language={isJson ? 'json' : 'plaintext'}
                  theme="vs-dark"
                  value={field.value as string}
                  onChange={(v) => field.onChange(v || '')}
                  options={{ minimap: { enabled: false }, fontSize: 13, automaticLayout: true }}
                />
              </Paper>
            )}
          />
        </div>
      )}
    </Stack>
  )
}
