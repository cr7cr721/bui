// pages/RulesListPage/components/ViewChangesModal.tsx
import { useState, useMemo } from 'react'
import {
  Modal,
  Text,
  Stack,
  Loader,
  Center,
  Alert,
  ScrollArea,
  Checkbox,
  Group,
  Box,
  Code,
} from '@mantine/core'
import { IconAlertCircle, IconGitCompare } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { rulesService } from '@/services'
import { computeDiff, flattenDiff, formatValue, type FlatDiffItem } from '@/utils/jsonDiff'

interface ViewChangesModalProps {
  opened: boolean
  onClose: () => void
  ruleId: number
  fromVersion: number
  toVersion: number
}

/**
 * Renders a single diff item with appropriate styling
 */
const DiffItem = ({ item, expandContext }: { item: FlatDiffItem; expandContext: boolean }) => {
  const indent = item.depth * 16

  // Container nodes (objects/arrays with nested changes)
  if (item.type === 'changed' && item.oldValue === undefined && item.newValue === undefined) {
    return (
      <Box style={{ paddingLeft: indent }}>
        <Text size="sm" c="dimmed" component="span">
          • {item.path}
        </Text>
      </Box>
    )
  }

  // Added items
  if (item.type === 'added') {
    const valueStr = formatValue(item.newValue)
    const isMultiline = valueStr.includes('\n')

    return (
      <Box style={{ paddingLeft: indent }}>
        <Text size="sm" c="teal" component="span">
          • {item.path}
        </Text>
        {expandContext || !isMultiline ? (
          <Code
            block={isMultiline}
            c="teal"
            style={{ marginLeft: 8, display: isMultiline ? 'block' : 'inline' }}
          >
            {valueStr}
          </Code>
        ) : (
          <Text size="sm" c="dimmed" component="span" style={{ marginLeft: 8 }}>
            (object/array added)
          </Text>
        )}
      </Box>
    )
  }

  // Removed items
  if (item.type === 'removed') {
    const valueStr = formatValue(item.oldValue)
    const isMultiline = valueStr.includes('\n')

    return (
      <Box style={{ paddingLeft: indent }}>
        <Text size="sm" c="red" component="span" td="line-through">
          • {item.path}
        </Text>
        {expandContext || !isMultiline ? (
          <Code
            block={isMultiline}
            c="red"
            style={{ marginLeft: 8, display: isMultiline ? 'block' : 'inline' }}
          >
            {valueStr}
          </Code>
        ) : (
          <Text size="sm" c="dimmed" component="span" style={{ marginLeft: 8 }}>
            (object/array removed)
          </Text>
        )}
      </Box>
    )
  }

  // Changed items (has both old and new values)
  if (item.type === 'changed') {
    const newValueStr = formatValue(item.newValue)
    const isMultiline = newValueStr.includes('\n')

    return (
      <Box style={{ paddingLeft: indent }}>
        <Text size="sm" c="cyan" component="span">
          • {item.path}
        </Text>
        {expandContext || !isMultiline ? (
          <Code
            block={isMultiline}
            c="cyan"
            style={{ marginLeft: 8, display: isMultiline ? 'block' : 'inline' }}
          >
            {newValueStr}
          </Code>
        ) : (
          <Text size="sm" c="dimmed" component="span" style={{ marginLeft: 8 }}>
            (value changed)
          </Text>
        )}
      </Box>
    )
  }

  return null
}

export const ViewChangesModal = ({
  opened,
  onClose,
  ruleId,
  fromVersion,
  toVersion,
}: ViewChangesModalProps) => {
  const [expandContext, setExpandContext] = useState(false)

  // Fetch the "from" version (older)
  const {
    data: fromRule,
    isLoading: fromLoading,
    error: fromError,
  } = useQuery({
    queryKey: ['rule', ruleId, fromVersion],
    queryFn: () => rulesService.getRule(ruleId, fromVersion),
    enabled: opened && fromVersion > 0,
  })

  // Fetch the "to" version (newer)
  const {
    data: toRule,
    isLoading: toLoading,
    error: toError,
  } = useQuery({
    queryKey: ['rule', ruleId, toVersion],
    queryFn: () => rulesService.getRule(ruleId, toVersion),
    enabled: opened && toVersion > 0,
  })

  const isLoading = fromLoading || toLoading
  const error = fromError || toError

  // Compute the diff between the two versions
  const diffItems = useMemo(() => {
    if (!fromRule?.body || !toRule?.body) return []

    const diff = computeDiff(fromRule.body, toRule.body)
    return flattenDiff(diff)
  }, [fromRule, toRule])

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconGitCompare size={20} />
          <Text fw={600}>
            Changes from version {fromVersion} to {toVersion}
          </Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        <Checkbox
          label="Expand context for text nodes"
          checked={expandContext}
          onChange={(e) => setExpandContext(e.currentTarget.checked)}
        />

        {isLoading ? (
          <Center py="xl">
            <Stack align="center" gap="sm">
              <Loader size="md" />
              <Text size="sm" c="dimmed">
                Loading versions...
              </Text>
            </Stack>
          </Center>
        ) : error ? (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            Failed to load rule versions: {error instanceof Error ? error.message : 'Unknown error'}
          </Alert>
        ) : diffItems.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed">No changes detected between these versions.</Text>
          </Center>
        ) : (
          <ScrollArea h={400}>
            <Box
              p="md"
              style={{
                backgroundColor: 'var(--mantine-color-dark-7)',
                borderRadius: 'var(--mantine-radius-sm)',
                fontFamily: 'monospace',
              }}
            >
              <Stack gap="xs">
                {diffItems.map((item, index) => (
                  <DiffItem
                    key={`${item.path}-${index}`}
                    item={item}
                    expandContext={expandContext}
                  />
                ))}
              </Stack>
            </Box>
          </ScrollArea>
        )}
      </Stack>
    </Modal>
  )
}
