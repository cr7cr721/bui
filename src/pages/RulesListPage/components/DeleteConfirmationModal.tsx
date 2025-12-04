import { Modal, Stack, Alert, Group, Button } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'

interface DeleteConfirmationModalProps {
  opened: boolean
  ruleCount: number
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export const DeleteConfirmationModal = ({
  opened,
  ruleCount,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) => {
  return (
    <Modal opened={opened} onClose={onClose} title="Delete Rules" centered>
      <Stack>
        <Alert color="red" icon={<IconAlertCircle size={16} />}>
          Are you sure you want to delete {ruleCount} rule
          {ruleCount !== 1 ? 's' : ''}? This action cannot be undone.
        </Alert>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="red" onClick={onConfirm} loading={isDeleting}>
            Delete {ruleCount} Rule{ruleCount !== 1 ? 's' : ''}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
