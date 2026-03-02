import { Button, Collapse, Divider, Text } from '@mantine/core'
import { useFormContext, Controller } from 'react-hook-form'
import { useDisclosure } from '@mantine/hooks'
import { IconCode } from '@tabler/icons-react'
import Editor from '@monaco-editor/react'
import type { RuleFormData } from '@/types/rule'
import type { ActionEditorProps } from './constants'

export const ActionIfCondition = ({ index }: ActionEditorProps) => {
  const { control, watch } = useFormContext<RuleFormData>()
  const currentValue = watch(`actions.${index}.ifCondition` as const) as string | undefined
  const [show, { toggle }] = useDisclosure(!!currentValue)

  return (
    <div>
      <Divider my="md" />
      <Button variant="subtle" size="xs" leftSection={<IconCode size={14} />} onClick={toggle}>
        {show ? 'Hide' : 'Show'} If Condition Script
      </Button>
      <Collapse in={show}>
        <Text size="xs" c="dimmed" mt="xs" mb="xs">
          Optional script that determines whether this action fires. Has access to the full runtime
          context. Return <code>true</code> to execute the action.
        </Text>
        <Controller
          name={`actions.${index}.ifCondition` as const}
          control={control}
          render={({ field }) => (
            <div
              style={{
                border: '1px solid var(--mantine-color-dark-4)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <Editor
                height="80px"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={(field.value as string) || ''}
                onChange={(v) => field.onChange(v || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>
          )}
        />
      </Collapse>
    </div>
  )
}
