import { Stack, Button, Group, Card, Text, Badge } from '@mantine/core'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { IconTrash, IconSearch, IconWorld, IconCode, IconChartLine } from '@tabler/icons-react'
import type { RuleFormData } from '@/types/rule'

const INPUT_TYPES = [
    { value: 'search', label: 'Search Input', icon: IconSearch },
    { value: 'http', label: 'HTTP Input', icon: IconWorld },
    { value: 'static', label: 'Static Input', icon: IconCode },
    { value: 'metric', label: 'Metric Input', icon: IconChartLine }
]

export const InputsStep = () => {
    const { control } = useFormContext<RuleFormData>()
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'inputs'
    })

    const addInput = (type: 'search' | 'http' | 'static' | 'metric') => {
        append({ type, config: {} })
    }

    return (
        <Stack gap="lg" mt="xl">
            <Group gap="sm">
                <Button
                    leftSection={<IconSearch size={16} />}
                    variant="light"
                    onClick={() => addInput('search')}
                >
                    Add Search Input
                </Button>
                <Button
                    leftSection={<IconWorld size={16} />}
                    variant="light"
                    onClick={() => addInput('http')}
                >
                    Add HTTP Input
                </Button>
                <Button
                    leftSection={<IconCode size={16} />}
                    variant="light"
                    onClick={() => addInput('static')}
                >
                    Add Static Input
                </Button>
                <Button
                    leftSection={<IconChartLine size={16} />}
                    variant="light"
                    onClick={() => addInput('metric')}
                >
                    Add Metric Input
                </Button>
            </Group>

            {fields.length === 0 && (
                <Card withBorder p="xl">
                    <Text c="dimmed" ta="center">
                        No inputs added yet. Click a button above to add an input.
                    </Text>
                </Card>
            )}

            <Stack gap="md">
                {fields.map((field, index) => {
                    const InputIcon = INPUT_TYPES.find(t => t.value === field.type)?.icon || IconCode

                    return (
                        <Card key={field.id} withBorder p="md">
                            <Group justify="space-between" mb="md">
                                <Group>
                                    <InputIcon size={20} />
                                    <Text fw={500}>
                                        {INPUT_TYPES.find(t => t.value === field.type)?.label}
                                    </Text>
                                    <Badge variant="light">{field.type}</Badge>
                                </Group>
                                <Button
                                    color="red"
                                    variant="subtle"
                                    size="xs"
                                    onClick={() => remove(index)}
                                >
                                    <IconTrash size={16} />
                                </Button>
                            </Group>

                            {/* TODO: Add specific configuration fields based on input type */}
                            <Text size="sm" c="dimmed">
                                Configuration options for {field.type} input will appear here
                            </Text>
                        </Card>
                    )
                })}
            </Stack>
        </Stack>
    )
}