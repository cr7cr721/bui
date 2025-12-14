import { Group, Button } from '@mantine/core'
import { IconCode, IconCheck } from '@tabler/icons-react'

interface Props {
  onBack: () => void
  onNext: () => void
  onViewJson: () => void
  onSave: () => void
  isFirstStep: boolean
  isLastStep: boolean
  isSubmitting: boolean
}

export const StepNavigation = ({
  onBack,
  onNext,
  onViewJson,
  onSave,
  isFirstStep,
  isLastStep,
  isSubmitting,
}: Props) => (
  <Group justify="space-between" mt="xl">
    <Button variant="default" onClick={onBack} disabled={isFirstStep}>
      Back
    </Button>
    <Group>
      <Button variant="light" onClick={onViewJson} leftSection={<IconCode size={16} />}>
        View JSON
      </Button>
      {isLastStep ? (
        <Button onClick={onSave} leftSection={<IconCheck size={16} />} loading={isSubmitting}>
          Save Rule
        </Button>
      ) : (
        <Button onClick={onNext}>Next</Button>
      )}
    </Group>
  </Group>
)
