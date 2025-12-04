import { Paper, Group, Text, Button } from '@mantine/core'
import { IconX, IconFolders, IconTrash } from '@tabler/icons-react'

interface BulkActionsToolbarProps {
  selectedCount: number
  onClearSelection: () => void
  onMoveToGroup: () => void
  onDelete: () => void
}

export const BulkActionsToolbar = ({
  selectedCount,
  onClearSelection,
  onMoveToGroup,
  onDelete,
}: BulkActionsToolbarProps) => {
  return (
    <Paper
      p="md"
      withBorder
      style={{
        backgroundColor:
          selectedCount > 0 ? 'var(--mantine-color-blue-9)' : 'var(--mantine-color-dark-6)',
        transition: 'background-color 0.2s',
      }}
    >
      <Group justify="space-between">
        <Group>
          {selectedCount > 0 ? (
            <>
              <Text fw={500}>
                {selectedCount} rule{selectedCount !== 1 ? 's' : ''} selected
              </Text>
              <Button
                variant="subtle"
                size="xs"
                onClick={onClearSelection}
                leftSection={<IconX size={14} />}
              >
                Clear Selection
              </Button>
            </>
          ) : (
            <Text c="dimmed" size="sm">
              Select rules to perform bulk actions
            </Text>
          )}
        </Group>

        <Group>
          <Button
            variant="light"
            color="blue"
            leftSection={<IconFolders size={16} />}
            onClick={onMoveToGroup}
            disabled={selectedCount === 0}
          >
            Move to Group
          </Button>
          <Button
            variant="light"
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={onDelete}
            disabled={selectedCount === 0}
          >
            Delete
          </Button>
        </Group>
      </Group>
    </Paper>
  )
}
