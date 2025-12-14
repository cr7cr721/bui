import { Stack, TextInput, Select, Text, Paper, Group } from '@mantine/core'
import { useFormContext, Controller } from 'react-hook-form'
import type { RuleFormData } from '@/types/rule'
import type { ActionEditorProps } from './constants'

export const ToggleActionEditor = ({ index }: ActionEditorProps) => {
  const { register, control, watch } = useFormContext<RuleFormData>()
  const ruleId = watch(`actions.${index}.ruleId` as const)
  const isStringId = ruleId && isNaN(parseInt(ruleId as string))

  return (
    <Stack gap="md">
      {isStringId && (
        <Paper p="sm" bg="yellow.9" withBorder>
          <Text size="sm" c="yellow.1">
            ⚠️ Use numeric rule IDs. String-based IDs are deprecated.
          </Text>
        </Paper>
      )}
      <Group grow>
        <TextInput
          label="Rule ID"
          description="Enter 0 to toggle this rule"
          placeholder="12345"
          {...register(`actions.${index}.ruleId` as const)}
        />
        <Controller
          name={`actions.${index}.enable` as const}
          control={control}
          render={({ field }) => (
            <Select
              label="Action"
              data={[
                { value: 'true', label: 'Enable' },
                { value: 'false', label: 'Disable' },
              ]}
              value={String(field.value)}
              onChange={(v) => field.onChange(v === 'true')}
            />
          )}
        />
      </Group>
    </Stack>
  )
}
