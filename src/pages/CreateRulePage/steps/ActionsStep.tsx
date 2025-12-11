import {
  Stack,
  Button,
  Group,
  Card,
  Text,
  Badge,
  TextInput,
  Select,
  Switch,
  Collapse,
  ActionIcon as MantineActionIcon,
  Paper,
  Divider,
  Grid,
} from '@mantine/core'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'
import { useDisclosure } from '@mantine/hooks'
import {
  IconTrash,
  IconMail,
  IconBell,
  IconPower,
  IconWorld,
  IconChevronDown,
  IconChevronUp,
  IconClock,
} from '@tabler/icons-react'
import Editor from '@monaco-editor/react'
import type { RuleFormData, ActionFormData } from '@/types/rule'
import {
  DEFAULT_EMAIL_ACTION,
  DEFAULT_TELEMETRY_ACTION,
  DEFAULT_TOGGLE_ACTION,
  DEFAULT_HTTP_ACTION,
} from '@/types/rule'

const ACTION_TYPES = [
  { value: 'email', label: 'Email Action', icon: IconMail, color: 'blue' },
  { value: 'telemetry', label: 'Telemetry Alert', icon: IconBell, color: 'orange' },
  { value: 'toggle', label: 'Toggle Rule', icon: IconPower, color: 'green' },
  { value: 'http', label: 'HTTP Request', icon: IconWorld, color: 'violet' },
] as const

export const ActionsStep = () => {
  const { control } = useFormContext<RuleFormData>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actions',
  })

  const addAction = (type: ActionFormData['type']) => {
    switch (type) {
      case 'email':
        append({ ...DEFAULT_EMAIL_ACTION })
        break
      case 'telemetry':
        append({ ...DEFAULT_TELEMETRY_ACTION })
        break
      case 'toggle':
        append({ ...DEFAULT_TOGGLE_ACTION })
        break
      case 'http':
        append({ ...DEFAULT_HTTP_ACTION })
        break
    }
  }

  return (
    <Stack gap="lg" mt="xl">
      <Group gap="sm">
        {ACTION_TYPES.map((actionType) => (
          <Button
            key={actionType.value}
            leftSection={<actionType.icon size={16} />}
            variant="light"
            color={actionType.color}
            onClick={() => addAction(actionType.value)}
          >
            Add {actionType.label}
          </Button>
        ))}
      </Group>

      {fields.length === 0 && (
        <Card withBorder p="xl">
          <Text c="dimmed" ta="center">
            No actions added yet. Click a button above to add an action.
          </Text>
        </Card>
      )}

      <Stack gap="md">
        {fields.map((field, index) => (
          <ActionEditor key={field.id} index={index} onRemove={() => remove(index)} />
        ))}
      </Stack>
    </Stack>
  )
}

// Individual Action Editor Component
interface ActionEditorProps {
  index: number
  onRemove: () => void
}

const ActionEditor = ({ index, onRemove }: ActionEditorProps) => {
  const { watch } = useFormContext<RuleFormData>()
  const [expanded, { toggle }] = useDisclosure(true)
  const action = watch(`actions.${index}`)
  const actionType = ACTION_TYPES.find((t) => t.value === action?.type)
  const ActionIcon = actionType?.icon || IconBell

  return (
    <Card withBorder p="md">
      <Group justify="space-between" mb={expanded ? 'md' : 0}>
        <Group>
          <ActionIcon size={20} color={`var(--mantine-color-${actionType?.color}-6)`} />
          <Text fw={500}>
            {actionType?.label} #{index + 1}
          </Text>
          <Badge variant="light" color={actionType?.color}>
            {action?.type}
          </Badge>
        </Group>
        <Group gap="xs">
          <MantineActionIcon variant="subtle" onClick={toggle}>
            {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </MantineActionIcon>
          <MantineActionIcon color="red" variant="subtle" onClick={onRemove}>
            <IconTrash size={16} />
          </MantineActionIcon>
        </Group>
      </Group>

      <Collapse in={expanded}>
        <Divider mb="md" />
        {action?.type === 'email' && <EmailActionEditor index={index} />}
        {action?.type === 'telemetry' && <TelemetryActionEditor index={index} />}
        {action?.type === 'toggle' && <ToggleActionEditor index={index} />}
        {action?.type === 'http' && <HttpActionEditor index={index} />}

        {/* Throttle Config - Common to all actions */}
        <ThrottleConfig index={index} />
      </Collapse>
    </Card>
  )
}

// Email Action Editor
const EmailActionEditor = ({ index }: { index: number }) => {
  const { register, control, watch } = useFormContext<RuleFormData>()
  const format = watch(`actions.${index}.format` as const)

  return (
    <Stack gap="md">
      <TextInput
        label="Subject"
        placeholder="Alert: ${context.ruleName}"
        {...register(`actions.${index}.subject` as const)}
      />

      <Grid>
        <Grid.Col span={6}>
          <TextInput
            label="To"
            description="Comma separated email addresses"
            placeholder="user@blizzard.com, team@blizzard.com"
            {...register(`actions.${index}.to` as const)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="BCC"
            description="Comma separated (optional)"
            placeholder="manager@blizzard.com"
            {...register(`actions.${index}.bcc` as const)}
          />
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={6}>
          <Controller
            name={`actions.${index}.format` as const}
            control={control}
            render={({ field }) => (
              <Select
                label="Format"
                data={[
                  { value: 'text', label: 'Text' },
                  { value: 'html', label: 'HTML' },
                  { value: 'markdown', label: 'Markdown' },
                ]}
                {...field}
                value={field.value as string}
              />
            )}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Controller
            name={`actions.${index}.templateType` as const}
            control={control}
            render={({ field }) => (
              <Select
                label="Template Type"
                data={[
                  { value: 'text', label: 'ES6 Template Literals' },
                  { value: 'handlebars', label: 'Handlebars' },
                ]}
                {...field}
                value={field.value as string}
              />
            )}
          />
        </Grid.Col>
      </Grid>

      <div>
        <Text size="sm" fw={500} mb="xs">
          Body
        </Text>
        <Controller
          name={`actions.${index}.body` as const}
          control={control}
          render={({ field }) => (
            <Paper withBorder style={{ overflow: 'hidden' }}>
              <Editor
                height="300px"
                language={format === 'html' ? 'html' : 'handlebars'}
                theme="vs-dark"
                value={field.value as string}
                onChange={(value) => field.onChange(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            </Paper>
          )}
        />
      </div>
    </Stack>
  )
}

// Telemetry Alert Action Editor
const TelemetryActionEditor = ({ index }: { index: number }) => {
  const { register, control } = useFormContext<RuleFormData>()

  return (
    <Stack gap="md">
      <TextInput
        label="Summary"
        placeholder="Alert summary"
        {...register(`actions.${index}.summary` as const)}
      />

      <div>
        <Text size="sm" fw={500} mb="xs">
          Description
        </Text>
        <Controller
          name={`actions.${index}.description` as const}
          control={control}
          render={({ field }) => (
            <Paper withBorder style={{ overflow: 'hidden' }}>
              <Editor
                height="200px"
                language="handlebars"
                theme="vs-dark"
                value={field.value as string}
                onChange={(value) => field.onChange(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                }}
              />
            </Paper>
          )}
        />
      </div>

      <Grid>
        <Grid.Col span={4}>
          <TextInput
            label="Qualifier"
            placeholder="Optional qualifier"
            {...register(`actions.${index}.qualifier` as const)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <TextInput
            label="Condition ID"
            placeholder="Optional condition ID"
            {...register(`actions.${index}.conditionId` as const)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Controller
            name={`actions.${index}.severity` as const}
            control={control}
            render={({ field }) => (
              <Select
                label="Severity"
                data={[
                  { value: '1', label: '1 - Info' },
                  { value: '2', label: '2 - Warning' },
                  { value: '3', label: '3 - Minor' },
                  { value: '4', label: '4 - Major' },
                  { value: '5', label: '5 - Critical' },
                ]}
                value={String(field.value)}
                onChange={(val) => field.onChange(parseInt(val || '4'))}
              />
            )}
          />
        </Grid.Col>
      </Grid>

      <Controller
        name={`actions.${index}.format` as const}
        control={control}
        render={({ field }) => (
          <Select
            label="Format"
            data={[
              { value: 'text', label: 'ES6 Template Literals' },
              { value: 'handlebars', label: 'Handlebars' },
            ]}
            {...field}
            value={field.value as string}
          />
        )}
      />
    </Stack>
  )
}

// Toggle Rule Action Editor
const ToggleActionEditor = ({ index }: { index: number }) => {
  const { register, control, watch } = useFormContext<RuleFormData>()
  const ruleId = watch(`actions.${index}.ruleId` as const)
  const isStringId = ruleId && isNaN(parseInt(ruleId as string))

  return (
    <Stack gap="md">
      {isStringId && (
        <Paper p="sm" bg="yellow.9" withBorder>
          <Text size="sm" c="yellow.1">
            ⚠️ This should reference a numeric rule ID. String-based rule IDs are deprecated but
            still work for backwards compatibility.
          </Text>
        </Paper>
      )}

      <Group grow>
        <TextInput
          label="Rule ID"
          description="Enter 0 to toggle this rule"
          placeholder="12345"
          {...register(`actions.${index}.ruleId` as const)}
        />
        <Controller
          name={`actions.${index}.enable` as const}
          control={control}
          render={({ field }) => (
            <Select
              label="Action"
              data={[
                { value: 'true', label: 'Enable' },
                { value: 'false', label: 'Disable' },
              ]}
              value={String(field.value)}
              onChange={(val) => field.onChange(val === 'true')}
            />
          )}
        />
      </Group>
    </Stack>
  )
}

// HTTP Request Action Editor
const HttpActionEditor = ({ index }: { index: number }) => {
  const { register, control, watch } = useFormContext<RuleFormData>()
  const method = watch(`actions.${index}.method` as const)
  const isJson = watch(`actions.${index}.isJson` as const)

  return (
    <Stack gap="md">
      <Paper p="sm" bg="yellow.9" withBorder>
        <Text size="sm" c="yellow.1">
          ⚠️ <strong>Notice:</strong> HTTP requests require access restrictions to be lifted.
          Contact the Data team for help.
        </Text>
      </Paper>

      <Group grow>
        <TextInput
          label="URL"
          placeholder="https://api.example.com/webhook"
          {...register(`actions.${index}.url` as const)}
        />
        <Controller
          name={`actions.${index}.method` as const}
          control={control}
          render={({ field }) => (
            <Select
              label="Method"
              data={['GET', 'POST', 'PUT']}
              {...field}
              value={field.value as string}
            />
          )}
        />
      </Group>

      <Controller
        name={`actions.${index}.isJson` as const}
        control={control}
        render={({ field }) => (
          <Switch
            label="Send / Receive as JSON"
            checked={field.value as boolean}
            onChange={(e) => field.onChange(e.currentTarget.checked)}
          />
        )}
      />

      {method !== 'GET' && (
        <div>
          <Text size="sm" fw={500} mb="xs">
            Request Body
          </Text>
          <Text size="xs" c="dimmed" mb="xs">
            Supports ES6 template literals: {'${context.transformed.value}'}
          </Text>
          <Controller
            name={`actions.${index}.body` as const}
            control={control}
            render={({ field }) => (
              <Paper withBorder style={{ overflow: 'hidden' }}>
                <Editor
                  height="200px"
                  language={isJson ? 'json' : 'plaintext'}
                  theme="vs-dark"
                  value={field.value as string}
                  onChange={(value) => field.onChange(value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                  }}
                />
              </Paper>
            )}
          />
        </div>
      )}
    </Stack>
  )
}

// Throttle Config - Common to all actions
const ThrottleConfig = ({ index }: { index: number }) => {
  const { register } = useFormContext<RuleFormData>()
  const [showThrottle, { toggle }] = useDisclosure(false)

  return (
    <div>
      <Divider my="md" />
      <Button variant="subtle" size="xs" leftSection={<IconClock size={14} />} onClick={toggle}>
        {showThrottle ? 'Hide' : 'Show'} Throttle Settings
      </Button>

      <Collapse in={showThrottle}>
        <Grid mt="md">
          <Grid.Col span={6}>
            <TextInput
              label="Throttle Key"
              description="Unique key for throttling (optional)"
              placeholder="${context.entity_key}"
              {...register(`actions.${index}.throttleKey` as const)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Throttle Duration"
              description="How long to throttle (e.g., 5m, 1h)"
              placeholder="5m"
              {...register(`actions.${index}.throttleDuration` as const)}
            />
          </Grid.Col>
        </Grid>
      </Collapse>
    </div>
  )
}
