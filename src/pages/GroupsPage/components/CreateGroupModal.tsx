import { Modal, Stack, TextInput, Switch, Group, Button } from '@mantine/core'
import { useForm } from '@mantine/form'

interface CreateGroupModalProps {
  opened: boolean
  isCreating: boolean
  onClose: () => void
  onSubmit: (data: { fullname: string; ad_group: string; public: boolean }) => void
}

export const CreateGroupModal = ({
  opened,
  isCreating,
  onClose,
  onSubmit,
}: CreateGroupModalProps) => {
  const form = useForm({
    initialValues: {
      fullname: '',
      ad_group: '',
      public: true,
    },
    validate: {
      fullname: (value) => (!value ? 'Full name is required' : null),
    },
  })

  const handleSubmit = (values: typeof form.values) => {
    onSubmit(values)
    form.reset()
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Create Group" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Full name"
            placeholder="Enter group name"
            required
            {...form.getInputProps('fullname')}
            disabled={isCreating}
          />

          <TextInput
            label="CN LDAP group"
            placeholder="Enter LDAP group (optional)"
            {...form.getInputProps('ad_group')}
            disabled={isCreating}
          />

          <Switch
            label="Public group"
            {...form.getInputProps('public', { type: 'checkbox' })}
            disabled={isCreating}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" loading={isCreating}>
              Create Group
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
