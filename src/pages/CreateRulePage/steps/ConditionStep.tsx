import { Stack, Paper, Text, Group, Button, Divider } from '@mantine/core'
import { useFormContext, Controller } from 'react-hook-form'
import { IconRefresh, IconAlertCircle } from '@tabler/icons-react'
import Editor from '@monaco-editor/react'
import type { RuleFormData } from '../../../types/rule'

export const ConditionStep = () => {
    const { control } = useFormContext<RuleFormData>()

//     const defaultCode = `// Condition function
// // Must return true or false
// function condition(transformed, parameters, context) {
//   //  condition logic here
//
//   // Example:
//   // return transformed.value > parameters.threshold;
//
//   return false;
// }
// `

    return (
        <Stack gap="lg" mt="xl">
            <Paper withBorder p="md" bg="dark.7">
                <Group justify="space-between" mb="sm">
                    <Group gap="xs">
                        <IconAlertCircle size={16} />
                        <Text size="sm" fw={500}>Condition Code</Text>
                    </Group>
                    <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconRefresh size={14} />}
                    >
                        Runtime Context
                    </Button>
                </Group>

                <Divider my="sm" />

                <Controller
                    name="conditionCode"
                    control={control}
                    render={({ field }) => (
                        <div style={{ border: '1px solid var(--mantine-color-dark-4)', borderRadius: 4 }}>
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
                                    tabSize: 2
                                }}
                            />
                        </div>
                    )}
                />
            </Paper>

            <Paper withBorder p="sm" bg="orange.9">
                <Text size="sm" c="orange.1">
                    ⚠️ <strong>Important:</strong> The condition function must return a boolean (true/false).
                    If true, the actions will be triggered.
                </Text>
            </Paper>
        </Stack>
    )
}