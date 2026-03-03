import { Stack, Paper, Text, Group, Divider, Grid } from '@mantine/core'
import { useFormContext, Controller } from 'react-hook-form'
import { IconBulb } from '@tabler/icons-react'
import Editor from '@monaco-editor/react'
import type { RuleFormData } from '@/types/rule'
import { RuntimeContextExplorer } from '../../components/RuntimeContextExplorer'

export const TransformStep = () => {
  const { control } = useFormContext<RuleFormData>()

  return (
    <Grid mt="xl" gutter="md">
      <Grid.Col span={8}>
        <Stack gap="lg">
          <Paper withBorder p="md" bg="dark.7">
            <Group gap="xs" mb="sm">
              <IconBulb size={16} />
              <Text size="sm" fw={500}>
                Transform Code
              </Text>
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
              The transform function receives inputs, parameters, and context. Return an object that
              will be used in the condition step.
            </Text>
          </Paper>
        </Stack>
      </Grid.Col>
      <Grid.Col span={4}>
        <RuntimeContextExplorer stopStep="transform" expandLevel={2} />
      </Grid.Col>
    </Grid>
  )
}
