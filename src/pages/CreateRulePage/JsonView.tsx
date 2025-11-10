import { useEffect, useState } from 'react'
import { Stack, Button, Group, Alert, Switch, Text, Paper } from '@mantine/core'
import { Editor } from '@monaco-editor/react'
import { IconCopy, IconFileImport, IconSparkles, IconArrowLeft } from '@tabler/icons-react'
import { useFormContext } from 'react-hook-form'
import { notifications } from '@mantine/notifications'
import { useDebouncedValue } from '@mantine/hooks'
import type { RuleFormData } from '@/types/rule'

interface JsonViewProps {
    onBackToForm: () => void
}

export const JsonView = ({ onBackToForm }: JsonViewProps) => {
    const { watch, reset } = useFormContext<RuleFormData>()
    const [jsonString, setJsonString] = useState('')
    const [jsonError, setJsonError] = useState<string | null>(null)
    const [liveSync, setLiveSync] = useState(true)
    const [isEditingJson, setIsEditingJson] = useState(false)

    // Watch all form changes
    const formData = watch()

    // Debounced JSON string for auto-sync
    const [debouncedJson] = useDebouncedValue(jsonString, 500)

    // Update JSON when form changes (form → JSON)
    // BUT only if user is not actively editing JSON
    useEffect(() => {
        if (liveSync && !isEditingJson) {
            const formJson = JSON.stringify(formData, null, 2)
            // Only update if different to avoid cursor jumps
            if (formJson !== jsonString) {
                setJsonString(formJson)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, liveSync, isEditingJson])
    // Note: jsonString intentionally excluded to prevent circular updates

    // Update form when JSON changes (JSON → form)
    useEffect(() => {
        if (!liveSync) return

        try {
            const parsed = JSON.parse(debouncedJson)

            // Only update if actually different
            const currentFormJson = JSON.stringify(formData)
            const newFormJson = JSON.stringify(parsed)

            if (currentFormJson !== newFormJson) {
                reset(parsed, { keepErrors: false })
                setJsonError(null)
            }

            // Done editing after debounce completes
            setIsEditingJson(false)
        } catch (error) {
            setJsonError(error instanceof Error ? error.message : 'Invalid JSON')
            setIsEditingJson(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedJson, liveSync])
    // Note: formData and reset intentionally excluded to prevent circular updates

    // Handle manual JSON edits
    const handleJsonChange = (value: string | undefined) => {
        if (!value) return

        // Mark that user is actively editing
        setIsEditingJson(true)
        setJsonString(value)

        // Immediate validation (no debounce for error display)
        try {
            JSON.parse(value)
            setJsonError(null)
        } catch (error) {
            setJsonError(error instanceof Error ? error.message : 'Invalid JSON')
        }
    }

    // Copy to clipboard
    const handleCopy = () => {
        navigator.clipboard.writeText(jsonString)
        notifications.show({
            message: 'Copied to clipboard',
            color: 'blue',
            icon: <IconCopy size={16} />,
        })
    }

    // Format JSON
    const handleFormat = () => {
        try {
            const parsed = JSON.parse(jsonString)
            const formatted = JSON.stringify(parsed, null, 2)
            setJsonString(formatted)

            notifications.show({
                message: 'JSON formatted',
                color: 'blue',
                icon: <IconSparkles size={16} />,
            })
        } catch (_error) {
            notifications.show({
                message: 'Cannot format invalid JSON',
                color: 'red',
            })
        }
    }

    // Import from clipboard
    const handleImport = async () => {
        try {
            const text = await navigator.clipboard.readText()
            setJsonString(text)

            // Try to parse and apply immediately
            try {
                const parsed = JSON.parse(text)
                reset(parsed)

                notifications.show({
                    message: 'Imported and applied from clipboard',
                    color: 'green',
                    icon: <IconFileImport size={16} />,
                })
            } catch (_error) {
                notifications.show({
                    message: 'Imported from clipboard (invalid JSON - fix and it will sync)',
                    color: 'orange',
                    icon: <IconFileImport size={16} />,
                })
            }
        } catch (_error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to read clipboard. Make sure to grant clipboard permissions.',
                color: 'red',
            })
        }
    }

    return (
        <Stack gap="md">
            {/* Header with Live Sync Toggle */}
            <Paper p="md" withBorder>
                <Group justify="space-between">
                    <Group>
                        <Switch
                            label="Two-way sync"
                            checked={liveSync}
                            onChange={(e) => setLiveSync(e.currentTarget.checked)}
                        />
                        <Text size="sm" c="dimmed">
                            {liveSync
                                ? '✨ Changes sync automatically between form and JSON'
                                : '✋ Sync disabled - edit freely without affecting form'
                            }
                        </Text>
                    </Group>

                    <Button
                        variant="light"
                        leftSection={<IconArrowLeft size={16} />}
                        onClick={onBackToForm}
                    >
                        Back to Form
                    </Button>
                </Group>
            </Paper>

            {/* Action Buttons */}
            <Group>
                <Button
                    leftSection={<IconCopy size={16} />}
                    variant="light"
                    onClick={handleCopy}
                >
                    Copy JSON
                </Button>
                <Button
                    leftSection={<IconSparkles size={16} />}
                    variant="light"
                    onClick={handleFormat}
                    disabled={!!jsonError}
                >
                    Format
                </Button>
                <Button
                    leftSection={<IconFileImport size={16} />}
                    variant="light"
                    onClick={handleImport}
                >
                    Import from Clipboard
                </Button>
            </Group>

            {/* Monaco Editor */}
            <Paper withBorder style={{ overflow: 'hidden' }}>
                <Editor
                    height="600px"
                    language="json"
                    theme="vs-dark"
                    value={jsonString}
                    onChange={handleJsonChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        formatOnPaste: true,
                        formatOnType: true,
                        automaticLayout: true,
                        tabSize: 2,
                        readOnly: false,
                    }}
                />
            </Paper>

            {/* Validation Status */}
            {jsonError ? (
                <Alert color="red" title="❌ Syntax Error">
                    {jsonError}
                    {liveSync && <Text size="sm" mt="xs">Fix the JSON syntax and it will sync after 500ms</Text>}
                </Alert>
            ) : (
                <Alert color="green" title="✅ Valid JSON">
                    {liveSync
                        ? isEditingJson
                            ? '⌨️ Typing... will sync in 500ms after you stop'
                            : '⚡ Synced with form'
                        : 'Sync is disabled - toggle on to sync with form'
                    }
                </Alert>
            )}

            {/* Info message when sync is off */}
            {!liveSync && (
                <Alert color="blue" title="ℹ️ Sync Disabled">
                    Enable "Two-way sync" to automatically sync changes between JSON and form
                </Alert>
            )}
        </Stack>
    )
}