import { Modal, Stack, TextInput, Switch, Group, Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useEffect } from 'react'
import type { Group as GroupType } from '@/types/api' // ← Alias the type

export interface EditGroupModalProps {
  opened: boolean
  group: GroupType | null // ← Use the alias
  isUpdating: boolean
  onClose: () => void
  onSubmit: (groupId: number, data: { fullname: string; ad_group: string; public: boolean }) => void
}

export const EditGroupModal = ({
  opened,
  group,
  isUpdating,
  onClose,
  onSubmit,
}: EditGroupModalProps) => {
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

  // Update form when group changes
  useEffect(() => {
    if (group) {
      form.setValues({
        fullname: group.fullname,
        ad_group: group.ad_group || '',
        public: group.public,
      })
    }
  }, [group])

  const handleSubmit = (values: typeof form.values) => {
    if (group) {
      onSubmit(group.id, values)
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Edit Group" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Full name"
            placeholder="Enter group name"
            required
            {...form.getInputProps('fullname')}
            disabled={isUpdating}
          />

          <TextInput
            label="CN LDAP group"
            placeholder="Enter LDAP group (optional)"
            {...form.getInputProps('ad_group')}
            disabled={isUpdating}
          />

          <Switch
            label="Public group"
            {...form.getInputProps('public', { type: 'checkbox' })}
            disabled={isUpdating}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={handleClose} disabled={isUpdating}>
              Cancel
            </Button>
            <Button type="submit" loading={isUpdating}>
              Update Group
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
