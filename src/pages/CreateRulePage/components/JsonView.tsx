import { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Stack, Group, Button, Text } from '@mantine/core'
import { IconForms, IconRefresh } from '@tabler/icons-react'
import Editor from '@monaco-editor/react'

import { transformFormToPayload } from '@/utils/ruleTransform'
import type { RuleFormData } from '@/types/rule'

interface Props {
  onBackToForm: () => void
}

export const JsonView = ({ onBackToForm }: Props) => {
  const { getValues } = useFormContext<RuleFormData>()
  const [json, setJson] = useState('')

  const refreshJson = () => {
    const formData = getValues()
    const payload = transformFormToPayload(formData)
    setJson(JSON.stringify(payload, null, 2))
  }

  useEffect(() => {
    refreshJson()
  }, [])

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Button variant="light" onClick={onBackToForm} leftSection={<IconForms size={16} />}>
          Back to Form
        </Button>
        <Button variant="subtle" onClick={refreshJson} leftSection={<IconRefresh size={16} />}>
          Refresh
        </Button>
      </Group>

      <Text size="sm" c="dimmed">
        This is a read-only preview of the API payload. Make changes in the Form view.
      </Text>

      <Editor
        height="600px"
        language="json"
        theme="vs-dark"
        value={json}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
        }}
      />
    </Stack>
  )
}
