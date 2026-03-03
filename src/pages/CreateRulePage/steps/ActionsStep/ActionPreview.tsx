import { useState, useCallback } from 'react'
import { Paper, Text, Button, Loader, Alert, Code, Stack, Divider, ScrollArea } from '@mantine/core'
import { IconEye } from '@tabler/icons-react'
import { useFormContext } from 'react-hook-form'
import { useRunRule } from '@/hooks/useApi'
import { transformFormToPayload } from '@/utils/ruleTransform'
import type { RuleFormData } from '@/types/rule'
import type { ActionPreview as ActionPreviewType } from '@/types/api'
import type { ActionEditorProps } from './constants'

export const ActionPreview = ({ index }: ActionEditorProps) => {
  const { getValues } = useFormContext<RuleFormData>()
  const runMutation = useRunRule()
  const [preview, setPreview] = useState<ActionPreviewType | null>(null)

  const handleRunPreview = useCallback(() => {
    const formData = getValues()
    const payload = transformFormToPayload(formData)

    runMutation.mutate(
      { rule: payload, stop: 'actions-preview' },
      {
        onSuccess: (data) => {
          if (data.preview) {
            const actionPreview = data.preview.find((a) => a.index === index)
            setPreview(actionPreview || null)
          } else {
            setPreview(null)
          }
        },
      }
    )
  }, [getValues, runMutation, index])

  const emailHtml = preview?.preview?.email?.html
  const emailText = preview?.preview?.email?.text
  const telemetryAlert = preview?.preview?.['telemetry-alert']

  return (
    <div>
      <Divider my="md" />
      <Button
        size="xs"
        variant="light"
        leftSection={runMutation.isPending ? <Loader size={12} /> : <IconEye size={14} />}
        onClick={handleRunPreview}
        disabled={runMutation.isPending}
      >
        Run Preview
      </Button>
      <Text size="xs" c="dimmed" mt={4}>
        Note: The rule must successfully trigger for the preview to render.
      </Text>

      {runMutation.isError && (
        <Alert color="red" variant="light" mt="xs" p="xs">
          <Text size="xs">
            {runMutation.error instanceof Error
              ? runMutation.error.message
              : 'Preview execution failed'}
          </Text>
        </Alert>
      )}

      {preview && (
        <Paper withBorder p="sm" mt="sm" bg="dark.7">
          {emailHtml && (
            <Stack gap="xs">
              <Text size="xs" fw={600}>
                Email Preview (HTML)
              </Text>
              <ScrollArea h={200}>
                <div
                  style={{
                    background: '#fff',
                    color: '#000',
                    padding: 12,
                    borderRadius: 4,
                    fontSize: 13,
                  }}
                  dangerouslySetInnerHTML={{ __html: emailHtml }}
                />
              </ScrollArea>
            </Stack>
          )}

          {emailText && (
            <Stack gap="xs" mt={emailHtml ? 'sm' : undefined}>
              <Text size="xs" fw={600}>
                Email Preview (Text)
              </Text>
              <Code block style={{ maxHeight: 150, overflow: 'auto' }}>
                {emailText}
              </Code>
            </Stack>
          )}

          {telemetryAlert && (
            <Stack gap="xs">
              <Text size="xs" fw={600}>
                Telemetry Alert Preview
              </Text>
              {telemetryAlert.description && (
                <Code block style={{ maxHeight: 120, overflow: 'auto' }}>
                  {telemetryAlert.description}
                </Code>
              )}
              {telemetryAlert.qualifier && (
                <Text size="xs" ff="monospace">
                  Qualifier: {telemetryAlert.qualifier}
                </Text>
              )}
              {telemetryAlert.condition_id && (
                <Text size="xs" ff="monospace">
                  ConditionID: {telemetryAlert.condition_id}
                </Text>
              )}
              {telemetryAlert.severity && (
                <Text size="xs" ff="monospace">
                  Severity: {telemetryAlert.severity}
                </Text>
              )}
            </Stack>
          )}

          {!emailHtml && !emailText && !telemetryAlert && (
            <Text size="xs" c="dimmed">
              No preview available. The condition may not have triggered.
            </Text>
          )}
        </Paper>
      )}
    </div>
  )
}
