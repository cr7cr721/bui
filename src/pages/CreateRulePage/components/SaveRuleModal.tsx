import { Modal, Stack, Select, Switch, Alert, Group, Button } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'

interface Props {
  opened: boolean
  onClose: () => void
  onSave: () => void
  groups: { value: string; label: string }[]
  selectedGroupId: string | null
  onGroupChange: (value: string | null) => void
  disableAfterSave: boolean
  onDisableChange: (value: boolean) => void
  isSubmitting: boolean
}

export const SaveRuleModal = ({
  opened,
  onClose,
  onSave,
  groups,
  selectedGroupId,
  onGroupChange,
  disableAfterSave,
  onDisableChange,
  isSubmitting,
}: Props) => (
  <Modal opened={opened} onClose={onClose} title="Save Rule" centered>
    <Stack gap="md">
      <Select
        label="Select BEAM Group"
        placeholder="Choose a group"
        data={groups}
        value={selectedGroupId}
        onChange={onGroupChange}
        required
        description="The rule will be saved to this group"
      />

      <Switch
        label="Disable rule after saving"
        description="The rule won't execute until manually enabled"
        checked={disableAfterSave}
        onChange={(e) => onDisableChange(e.currentTarget.checked)}
      />

      {groups.length === 0 && (
        <Alert color="red" icon={<IconAlertCircle size={16} />}>
          You don't have write access to any groups. Contact an admin.
        </Alert>
      )}

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onSave} loading={isSubmitting} disabled={!selectedGroupId}>
          Create Rule
        </Button>
      </Group>
    </Stack>
  </Modal>
)
