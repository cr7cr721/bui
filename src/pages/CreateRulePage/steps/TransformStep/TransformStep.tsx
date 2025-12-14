import { Stack, Paper, Text, Group, Button, Divider } from '@mantine/core'
import { useFormContext, Controller } from 'react-hook-form'
import { IconRefresh, IconBulb } from '@tabler/icons-react'
import Editor from '@monaco-editor/react'
import type { RuleFormData } from '@/types/rule'

export const TransformStep = () => {
  const { control } = useFormContext<RuleFormData>()

  return (
    <Stack gap="lg" mt="xl">
      <Paper withBorder p="md" bg="dark.7">
        <Group justify="space-between" mb="sm">
          <Group gap="xs">
            <IconBulb size={16} />
            <Text size="sm" fw={500}>
              Transform Code
            </Text>
          </Group>
          <Button size="xs" variant="light" leftSection={<IconRefresh size={14} />}>
            Runtime Context
          </Button>
        </Group>

        <Divider my="sm" />

        <Controller
          name="transformCode"
          control={control}
          render={({ field }) => (
            <div
              style={{
                border: '1px solid var(--mantine-color-dark-4)',
                borderRadius: 4,
              }}
            >
              <Editor
                height="400px"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={field.value}
                onChange={(value) => field.onChange(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>
          )}
        />
      </Paper>

      <Paper withBorder p="sm" bg="blue.9">
        <Text size="sm" c="blue.1">
          💡 <strong>Tip:</strong> The transform function receives inputs, parameters, and context.
          Return an object that will be used in the condition step.
        </Text>
      </Paper>
    </Stack>
  )
}
