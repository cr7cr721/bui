import { Paper, Group, Text, Button, Badge, Transition } from '@mantine/core'
import { IconX, IconTransfer, IconTrash, IconCheckbox } from '@tabler/icons-react'

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
  const hasSelection = selectedCount > 0

  return (
    <Paper
      p="sm"
      withBorder
      style={{
        backgroundColor: hasSelection
          ? 'var(--mantine-color-blue-9)'
          : 'var(--mantine-color-dark-7)',
        borderColor: hasSelection ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-dark-5)',
        transition: 'all 0.2s ease',
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Transition mounted={hasSelection} transition="slide-right" duration={200}>
            {(styles) => (
              <Group gap="xs" style={styles}>
                <IconCheckbox size={18} />
                <Badge variant="light" color="blue" size="lg">
                  {selectedCount}
                </Badge>
                <Text size="sm" fw={500}>
                  rule{selectedCount !== 1 ? 's' : ''} selected
                </Text>
                <Button
                  variant="subtle"
                  size="xs"
                  color="blue.3"
                  onClick={onClearSelection}
                  leftSection={<IconX size={14} />}
                  styles={{
                    root: { paddingLeft: 8, paddingRight: 10 },
                  }}
                >
                  Clear
                </Button>
              </Group>
            )}
          </Transition>

          {!hasSelection && (
            <Text c="dimmed" size="sm">
              Select rules to perform bulk actions
            </Text>
          )}
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Button
            variant={hasSelection ? 'light' : 'subtle'}
            color="blue"
            size="sm"
            leftSection={<IconTransfer size={16} />}
            onClick={onMoveToGroup}
            disabled={!hasSelection}
          >
            Move
          </Button>
          <Button
            variant={hasSelection ? 'light' : 'subtle'}
            color="red"
            size="sm"
            leftSection={<IconTrash size={16} />}
            onClick={onDelete}
            disabled={!hasSelection}
          >
            Delete
          </Button>
        </Group>
      </Group>
    </Paper>
  )
}
