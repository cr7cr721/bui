import { TextInput, Button, Collapse, Divider, Grid } from '@mantine/core'
import { useFormContext } from 'react-hook-form'
import { useDisclosure } from '@mantine/hooks'
import { IconClock } from '@tabler/icons-react'
import type { RuleFormData } from '@/types/rule'
import type { ActionEditorProps } from './constants'

export const ThrottleConfig = ({ index }: ActionEditorProps) => {
  const { register } = useFormContext<RuleFormData>()
  const [show, { toggle }] = useDisclosure(false)

  return (
    <div>
      <Divider my="md" />
      <Button variant="subtle" size="xs" leftSection={<IconClock size={14} />} onClick={toggle}>
        {show ? 'Hide' : 'Show'} Throttle Settings
      </Button>
      <Collapse in={show}>
        <Grid mt="md">
          <Grid.Col span={6}>
            <TextInput
              label="Throttle Key"
              description="Optional"
              placeholder="${context.entity_key}"
              {...register(`actions.${index}.throttleKey` as const)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Throttle Duration"
              description="e.g., 5m, 1h"
              placeholder="5m"
              {...register(`actions.${index}.throttleDuration` as const)}
            />
          </Grid.Col>
        </Grid>
      </Collapse>
    </div>
  )
}
