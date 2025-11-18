import { useState } from 'react'
import { Stack, Button, Loader, Center, Text, Alert } from '@mantine/core'
import { IconAlertCircle, IconPlus } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useUser, useCreateGroup, useUpdateGroup } from '@/hooks/useApi'
import { GroupsTable } from './components/GroupsTable'
import { CreateGroupModal } from './components/CreateGroupModal'
import { EditGroupModal } from './components/EditGroupModal'
import type { Group } from '@/types/api'

export const GroupsPage = () => {
    const { data: user, isLoading, error } = useUser()
    const createGroupMutation = useCreateGroup()
    const updateGroupMutation = useUpdateGroup()

    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

    const isAdmin = user?.admin || false

    const handleCreateGroup = async (data: { fullname: string; ad_group: string; public: boolean }) => {
        try {
            await createGroupMutation.mutateAsync(data)

            notifications.show({
                title: 'Success',
                message: `Group "${data.fullname}" created successfully`,
                color: 'green'
            })

            setCreateModalOpen(false)
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: error instanceof Error ? error.message : 'Failed to create group',
                color: 'red'
            })
        }
    }

    const handleUpdateGroup = async (
        groupId: number,
        data: { fullname: string; ad_group: string; public: boolean }
    ) => {
        try {
            await updateGroupMutation.mutateAsync({ groupId, data })

            notifications.show({
                title: 'Success',
                message: `Group "${data.fullname}" updated successfully`,
                color: 'green'
            })

            setEditModalOpen(false)
            setSelectedGroup(null)
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: error instanceof Error ? error.message : 'Failed to update group',
                color: 'red'
            })
        }
    }

    const handleEditGroup = (group: Group) => {
        setSelectedGroup(group)
        setEditModalOpen(true)
    }

    const handleCloseEditModal = () => {
        setEditModalOpen(false)
        setSelectedGroup(null)
    }

    if (isLoading) {
        return (
            <Center py={60}>
                <Stack align="center" gap="md">
                    <Loader size="xl" />
                    <Text c="dimmed">Loading groups...</Text>
                </Stack>
            </Center>
        )
    }

    if (error) {
        return (
            <Alert
                icon={<IconAlertCircle size={16} />}
                title="Error loading groups"
                color="red"
                variant="light"
            >
                {error.message}
            </Alert>
        )
    }

    return (
        <Stack gap="lg">
            {isAdmin && (
                <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => setCreateModalOpen(true)}
                    style={{ alignSelf: 'flex-start' }}
                >
                    Create Group
                </Button>
            )}

            <GroupsTable
                groups={user?.groups || []}
                isAdmin={isAdmin}
                onEdit={handleEditGroup}
            />

            <CreateGroupModal
                opened={createModalOpen}
                isCreating={createGroupMutation.isPending}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreateGroup}
            />

            <EditGroupModal
                opened={editModalOpen}
                group={selectedGroup}
                isUpdating={updateGroupMutation.isPending}
                onClose={handleCloseEditModal}
                onSubmit={handleUpdateGroup}
            />
        </Stack>
    )
}