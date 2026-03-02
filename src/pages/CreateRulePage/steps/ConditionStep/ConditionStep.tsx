import { Stack, Paper, Text, Group, Divider, Grid } from '@mantine/core'
import { useFormContext, Controller } from 'react-hook-form'
import { IconAlertCircle } from '@tabler/icons-react'
import Editor from '@monaco-editor/react'
import type { RuleFormData } from '@/types/rule'
import { RuntimeContextExplorer } from '../../components/RuntimeContextExplorer'

export const ConditionStep = () => {
  const { control, watch } = useFormContext<RuleFormData>()
  const conditionCode = watch('conditionCode')

  // If condition code exists, run up to 'trigger' step; otherwise up to 'transform'
  const stopStep = conditionCode?.trim() ? 'trigger' : 'transform'

  return (
    <Stack gap="lg" mt="xl">
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="md" bg="dark.7">
            <Group gap="xs" mb="sm">
              <IconAlertCircle size={16} />
              <Text size="sm" fw={500}>
                Condition Code
              </Text>
            </Group>

            <Divider my="sm" />

            <Controller
              name="conditionCode"
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
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <RuntimeContextExplorer stopStep={stopStep} rootName="ctx" expandLevel={2} height={400} />
        </Grid.Col>
      </Grid>

      <Paper withBorder p="sm" bg="orange.9">
        <Text size="sm" c="orange.1">
          ⚠️ <strong>Important:</strong> The condition function must return a boolean (true/false).
          If true, the actions will be triggered.
        </Text>
      </Paper>
    </Stack>
  )
}
