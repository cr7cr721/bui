import { useState } from 'react'
import {
  Paper,
  Text,
  Button,
  Group,
  ScrollArea,
  Alert,
  Loader,
  Stack,
  Code,
  Collapse,
  UnstyledButton,
  Box,
  Badge,
} from '@mantine/core'
import {
  IconRefresh,
  IconAlertTriangle,
  IconChevronRight,
  IconChevronDown,
} from '@tabler/icons-react'
import { useRulePreview } from '../useRulePreview'
import type { StopStep } from '@/types/api'

// =============================================================================
// JSON Tree Viewer (replacement for react-inspector)
// =============================================================================

interface JsonNodeProps {
  name: string
  data: unknown
  depth: number
  defaultExpanded: number
}

const JsonNode = ({ name, data, depth, defaultExpanded }: JsonNodeProps) => {
  const [expanded, setExpanded] = useState(depth < defaultExpanded)

  if (data === null) {
    return (
      <Group gap={4} ml={depth * 16}>
        <Text size="xs" ff="monospace" c="dimmed">
          {name}:
        </Text>
        <Text size="xs" ff="monospace" c="orange">
          null
        </Text>
      </Group>
    )
  }

  if (typeof data === 'undefined') {
    return (
      <Group gap={4} ml={depth * 16}>
        <Text size="xs" ff="monospace" c="dimmed">
          {name}:
        </Text>
        <Text size="xs" ff="monospace" c="gray">
          undefined
        </Text>
      </Group>
    )
  }

  if (typeof data === 'boolean') {
    return (
      <Group gap={4} ml={depth * 16}>
        <Text size="xs" ff="monospace" c="dimmed">
          {name}:
        </Text>
        <Text size="xs" ff="monospace" c="blue">
          {data.toString()}
        </Text>
      </Group>
    )
  }

  if (typeof data === 'number') {
    return (
      <Group gap={4} ml={depth * 16}>
        <Text size="xs" ff="monospace" c="dimmed">
          {name}:
        </Text>
        <Text size="xs" ff="monospace" c="teal">
          {data}
        </Text>
      </Group>
    )
  }

  if (typeof data === 'string') {
    const displayValue = data.length > 120 ? data.slice(0, 120) + '\u2026' : data
    return (
      <Group gap={4} ml={depth * 16} wrap="nowrap" align="flex-start">
        <Text size="xs" ff="monospace" c="dimmed" style={{ flexShrink: 0 }}>
          {name}:
        </Text>
        <Text size="xs" ff="monospace" c="green" style={{ wordBreak: 'break-all' }}>
          &quot;{displayValue}&quot;
        </Text>
      </Group>
    )
  }

  if (Array.isArray(data)) {
    const label = `Array(${data.length})`
    return (
      <Box ml={depth * 16}>
        <UnstyledButton onClick={() => setExpanded(!expanded)}>
          <Group gap={2}>
            {expanded ? (
              <IconChevronDown size={12} color="gray" />
            ) : (
              <IconChevronRight size={12} color="gray" />
            )}
            <Text size="xs" ff="monospace" c="dimmed">
              {name}:
            </Text>
            <Text size="xs" ff="monospace" c="violet.4">
              {label}
            </Text>
          </Group>
        </UnstyledButton>
        <Collapse in={expanded}>
          {data.map((item, i) => (
            <JsonNode
              key={i}
              name={String(i)}
              data={item}
              depth={depth + 1}
              defaultExpanded={defaultExpanded}
            />
          ))}
        </Collapse>
      </Box>
    )
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data as Record<string, unknown>)
    const label = `{${keys.length} ${keys.length === 1 ? 'key' : 'keys'}}`
    return (
      <Box ml={depth * 16}>
        <UnstyledButton onClick={() => setExpanded(!expanded)}>
          <Group gap={2}>
            {expanded ? (
              <IconChevronDown size={12} color="gray" />
            ) : (
              <IconChevronRight size={12} color="gray" />
            )}
            <Text size="xs" ff="monospace" c="dimmed">
              {name}:
            </Text>
            <Text size="xs" ff="monospace" c="violet.4">
              {label}
            </Text>
          </Group>
        </UnstyledButton>
        <Collapse in={expanded}>
          {keys.map((key) => (
            <JsonNode
              key={key}
              name={key}
              data={(data as Record<string, unknown>)[key]}
              depth={depth + 1}
              defaultExpanded={defaultExpanded}
            />
          ))}
        </Collapse>
      </Box>
    )
  }

  return (
    <Group gap={4} ml={depth * 16}>
      <Text size="xs" ff="monospace" c="dimmed">
        {name}:
      </Text>
      <Text size="xs" ff="monospace">
        {String(data)}
      </Text>
    </Group>
  )
}

// =============================================================================
// Runtime Context Explorer
// =============================================================================

interface RuntimeContextExplorerProps {
  stopStep: StopStep
  rootName?: string
  expandLevel?: number
  ctxSelector?: (ctx: Record<string, unknown>) => unknown
  height?: number
}

export const RuntimeContextExplorer = ({
  stopStep,
  rootName = 'ctx',
  expandLevel = 3,
  ctxSelector,
  height = 350,
}: RuntimeContextExplorerProps) => {
  const { result, isRunning, error, run, hasCachedData } = useRulePreview({
    stopStep,
    autoRun: true,
    debounceMs: 1200,
  })

  const ctxDisplay = result?.ctx ? (ctxSelector ? ctxSelector(result.ctx) : result.ctx) : null
  const hasRuntimeError = result?.audit && !result.audit.summary.success

  return (
    <Paper withBorder p="sm" bg="dark.8" style={{ minWidth: 280 }}>
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <Text size="sm" fw={600} c="dimmed">
            Runtime Context
          </Text>
          {hasCachedData && !isRunning && (
            <Badge size="xs" variant="dot" color="green">
              Live
            </Badge>
          )}
          {isRunning && (
            <Badge size="xs" variant="dot" color="yellow">
              {hasCachedData ? 'Updating' : 'Loading'}
            </Badge>
          )}
        </Group>
        <Button
          size="compact-xs"
          variant="light"
          leftSection={isRunning ? <Loader size={12} /> : <IconRefresh size={12} />}
          onClick={run}
          disabled={isRunning}
          color="teal"
        >
          {isRunning ? 'Running\u2026' : 'Refresh'}
        </Button>
      </Group>

      {hasRuntimeError && (
        <Alert
          icon={<IconAlertTriangle size={14} />}
          color="red"
          variant="light"
          mb="xs"
          p="xs"
          title="Runtime Error"
        >
          <Code block style={{ fontSize: 11, maxHeight: 100, overflow: 'auto' }}>
            {result?.audit?.summary?.error?.slice(0, 250)}
          </Code>
        </Alert>
      )}

      {error && (
        <Alert color="red" variant="light" mb="xs" p="xs">
          <Text size="xs">{error.message || 'Failed to execute rule preview'}</Text>
        </Alert>
      )}

      <ScrollArea h={height} type="auto">
        {ctxDisplay ? (
          <JsonNode name={rootName} data={ctxDisplay} depth={0} defaultExpanded={expandLevel} />
        ) : isRunning ? (
          <Stack align="center" justify="center" h={120}>
            <Loader size="sm" />
            <Text size="xs" c="dimmed">
              Executing rule preview...
            </Text>
          </Stack>
        ) : (
          <Stack align="center" justify="center" h={120}>
            <Loader size="xs" color="dimmed" />
            <Text size="xs" c="dimmed" ta="center">
              Initializing preview...
            </Text>
          </Stack>
        )}
      </ScrollArea>
    </Paper>
  )
}
