import { Paper, Stack, Title, Text, Group, Button } from '@mantine/core'
import { IconCheck, IconCode } from '@tabler/icons-react'

interface Props {
  onReviewJson: () => void
  onSave: () => void
  isSubmitting: boolean
}

export const CompletedStep = ({ onReviewJson, onSave, isSubmitting }: Props) => (
  <Paper p="xl" withBorder mt="xl" bg="dark.7">
    <Stack gap="md">
      <Title order={4}>
        <IconCheck size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
        Ready to Save
      </Title>
      <Text c="dimmed">
        Your rule configuration is complete. Review the JSON or click Save to create your rule.
      </Text>
      <Group>
        <Button variant="light" onClick={onReviewJson} leftSection={<IconCode size={16} />}>
          Review JSON
        </Button>
        <Button onClick={onSave} leftSection={<IconCheck size={16} />} loading={isSubmitting}>
          Save Rule
        </Button>
      </Group>
    </Stack>
  </Paper>
)
