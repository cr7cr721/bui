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
  ActionIcon,
  Paper,
  Divider,
} from '@mantine/core'
import { useFormContext, useFieldArray, Controller } from 'react-hook-form'
import { useDisclosure } from '@mantine/hooks'
import {
  IconTrash,
  IconSearch,
  IconWorld,
  IconCode,
  IconChartLine,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react'
import Editor from '@monaco-editor/react'
import type { RuleFormData, InputFormData } from '@/types/rule'
import {
  DEFAULT_SEARCH_INPUT,
  DEFAULT_HTTP_INPUT,
  DEFAULT_STATIC_INPUT,
  DEFAULT_METRIC_INPUT,
} from '@/types/rule'

const INPUT_TYPES = [
  { value: 'search', label: 'Search Input', icon: IconSearch, color: 'blue' },
  { value: 'http', label: 'HTTP Input', icon: IconWorld, color: 'green' },
  { value: 'static', label: 'Static Input', icon: IconCode, color: 'orange' },
  { value: 'metric', label: 'Metric Input', icon: IconChartLine, color: 'violet' },
] as const

export const InputsStep = () => {
  const { control } = useFormContext<RuleFormData>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'inputs',
  })

  const addInput = (type: InputFormData['type']) => {
    switch (type) {
      case 'search':
        append({ ...DEFAULT_SEARCH_INPUT })
        break
      case 'http':
        append({ ...DEFAULT_HTTP_INPUT })
        break
      case 'static':
        append({ ...DEFAULT_STATIC_INPUT })
        break
      case 'metric':
        append({ ...DEFAULT_METRIC_INPUT })
        break
    }
  }

  return (
    <Stack gap="lg" mt="xl">
      <Group gap="sm">
        {INPUT_TYPES.map((inputType) => (
          <Button
            key={inputType.value}
            leftSection={<inputType.icon size={16} />}
            variant="light"
            color={inputType.color}
            onClick={() => addInput(inputType.value)}
          >
            Add {inputType.label}
          </Button>
        ))}
      </Group>

      {fields.length === 0 && (
        <Card withBorder p="xl">
          <Text c="dimmed" ta="center">
            No inputs added yet. Click a button above to add an input.
          </Text>
        </Card>
      )}

      <Stack gap="md">
        {fields.map((field, index) => (
          <InputEditor key={field.id} index={index} onRemove={() => remove(index)} />
        ))}
      </Stack>
    </Stack>
  )
}

// Individual Input Editor Component
interface InputEditorProps {
  index: number
  onRemove: () => void
}

const InputEditor = ({ index, onRemove }: InputEditorProps) => {
  const { watch, control, register } = useFormContext<RuleFormData>()
  const [expanded, { toggle }] = useDisclosure(true)
  const input = watch(`inputs.${index}`)
  const inputType = INPUT_TYPES.find((t) => t.value === input?.type)
  const InputIcon = inputType?.icon || IconCode

  return (
    <Card withBorder p="md">
      <Group justify="space-between" mb={expanded ? 'md' : 0}>
        <Group>
          <InputIcon size={20} color={`var(--mantine-color-${inputType?.color}-6)`} />
          <Text fw={500}>
            {inputType?.label} #{index + 1}
          </Text>
          <Badge variant="light" color={inputType?.color}>
            {input?.type}
          </Badge>
        </Group>
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={toggle}>
            {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          </ActionIcon>
          <ActionIcon color="red" variant="subtle" onClick={onRemove}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <Collapse in={expanded}>
        <Divider mb="md" />
        {input?.type === 'search' && <SearchInputEditor index={index} />}
        {input?.type === 'http' && (
          <HttpInputEditor index={index} control={control} register={register} />
        )}
        {input?.type === 'static' && <StaticInputEditor index={index} />}
        {input?.type === 'metric' && (
          <MetricInputEditor index={index} control={control} register={register} />
        )}
      </Collapse>
    </Card>
  )
}

// Search Input Editor
const SearchInputEditor = ({ index }: { index: number }) => {
  const { register, control } = useFormContext<RuleFormData>()

  return (
    <Stack gap="md">
      <TextInput
        label="Search Index"
        placeholder="all-telemetry-v2-*"
        description="Elasticsearch index pattern to search"
        {...register(`inputs.${index}.index` as const)}
      />

      <div>
        <Text size="sm" fw={500} mb="xs">
          Search Body (JSON)
        </Text>
        <Controller
          name={`inputs.${index}.searchBody` as const}
          control={control}
          render={({ field }) => (
            <Paper withBorder style={{ overflow: 'hidden' }}>
              <Editor
                height="300px"
                language="json"
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
    </Stack>
  )
}

// HTTP Input Editor
const HttpInputEditor = ({
  index,
  control,
  register,
}: {
  index: number
  control: ReturnType<typeof useFormContext<RuleFormData>>['control']
  register: ReturnType<typeof useFormContext<RuleFormData>>['register']
}) => {
  const { watch } = useFormContext<RuleFormData>()
  const method = watch(`inputs.${index}.method` as const)
  const isJson = watch(`inputs.${index}.isJson` as const)

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
          placeholder="https://api.example.com/endpoint"
          {...register(`inputs.${index}.url` as const)}
        />
        <Controller
          name={`inputs.${index}.method` as const}
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
        name={`inputs.${index}.isJson` as const}
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
          <Controller
            name={`inputs.${index}.body` as const}
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

// Static Input Editor
const StaticInputEditor = ({ index }: { index: number }) => {
  const { control } = useFormContext<RuleFormData>()

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Define static JSON data that will be available to your rule.
      </Text>
      <Controller
        name={`inputs.${index}.json` as const}
        control={control}
        render={({ field }) => (
          <Paper withBorder style={{ overflow: 'hidden' }}>
            <Editor
              height="300px"
              language="json"
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
    </Stack>
  )
}

// Metric Input Editor
const MetricInputEditor = ({
  index,
  control,
  register,
}: {
  index: number
  control: ReturnType<typeof useFormContext<RuleFormData>>['control']
  register: ReturnType<typeof useFormContext<RuleFormData>>['register']
}) => {
  return (
    <Stack gap="md">
      <Group grow>
        <TextInput
          label="Metric Name"
          placeholder="my.metric.name"
          {...register(`inputs.${index}.metricName` as const)}
        />
      </Group>

      <Group grow>
        <TextInput
          label="Start Relative Value"
          placeholder="10"
          {...register(`inputs.${index}.startValue` as const)}
        />
        <Controller
          name={`inputs.${index}.startUnit` as const}
          control={control}
          render={({ field }) => (
            <Select
              label="Unit"
              data={[
                { value: 'seconds', label: 'Seconds' },
                { value: 'minutes', label: 'Minutes' },
                { value: 'hours', label: 'Hours' },
                { value: 'days', label: 'Days' },
                { value: 'weeks', label: 'Weeks' },
                { value: 'months', label: 'Months' },
                { value: 'years', label: 'Years' },
              ]}
              {...field}
              value={field.value as string}
            />
          )}
        />
      </Group>

      <div>
        <Text size="sm" fw={500} mb="xs">
          Tags (JSON)
        </Text>
        <Controller
          name={`inputs.${index}.tags` as const}
          control={control}
          render={({ field }) => (
            <Paper withBorder style={{ overflow: 'hidden' }}>
              <Editor
                height="100px"
                language="json"
                theme="vs-dark"
                value={field.value as string}
                onChange={(value) => field.onChange(value || '{}')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </Paper>
          )}
        />
      </div>

      <div>
        <Text size="sm" fw={500} mb="xs">
          Group By (JSON Array)
        </Text>
        <Controller
          name={`inputs.${index}.groupBy` as const}
          control={control}
          render={({ field }) => (
            <Paper withBorder style={{ overflow: 'hidden' }}>
              <Editor
                height="80px"
                language="json"
                theme="vs-dark"
                value={field.value as string}
                onChange={(value) => field.onChange(value || '[]')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </Paper>
          )}
        />
      </div>

      <div>
        <Text size="sm" fw={500} mb="xs">
          Aggregators (JSON Array)
        </Text>
        <Controller
          name={`inputs.${index}.aggregators` as const}
          control={control}
          render={({ field }) => (
            <Paper withBorder style={{ overflow: 'hidden' }}>
              <Editor
                height="80px"
                language="json"
                theme="vs-dark"
                value={field.value as string}
                onChange={(value) => field.onChange(value || '[]')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'off',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </Paper>
          )}
        />
      </div>
    </Stack>
  )
}
