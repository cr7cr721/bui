import { Modal, Stack, Text, Select, Group, Button } from '@mantine/core'
import type { Group as GroupType } from '@/types/api'

interface MoveToGroupModalProps {
    opened: boolean
    ruleCount: number
    groups: GroupType[]
    selectedGroup: string | null
    isMoving: boolean
    onClose: () => void
    onGroupChange: (value: string | null) => void
    onConfirm: () => void
}

export const MoveToGroupModal = ({
                                     opened,
                                     ruleCount,
                                     groups,
                                     selectedGroup,
                                     isMoving,
                                     onClose,
                                     onGroupChange,
                                     onConfirm
                                 }: MoveToGroupModalProps) => {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Move Rules to Group"
            centered
        >
            <Stack>
                <Text size="sm" c="dimmed">
                    Move {ruleCount} rule{ruleCount !== 1 ? 's' : ''} to a different group
                </Text>

                <Select
                    label="Target Group"
                    placeholder="Select group"
                    data={groups.map((group) => ({
                        value: group.id.toString(),
                        label: group.fullname
                    }))}
                    value={selectedGroup}
                    onChange={onGroupChange}
                    required
                    searchable
                    nothingFoundMessage="No groups found"
                    disabled={isMoving}
                />

                <Group justify="flex-end">
                    <Button
                        variant="default"
                        onClick={onClose}
                        disabled={isMoving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={!selectedGroup}
                        loading={isMoving}
                    >
                        Move Rules
                    </Button>
                </Group>
            </Stack>
        </Modal>
    )
}