import { Stack, TextInput, Button, Group, Tabs, Code } from '@mantine/core'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import type { RuleFormData } from "../../../types/rule";


export const ParametersStep = () => {
    const { register, control } = useFormContext<RuleFormData>()
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'parameters'
    })

    return (
        <Stack gap="lg" mt="xl">
            <Tabs defaultValue="simple">
                <Tabs.List>
                    <Tabs.Tab value="simple">Simple</Tabs.Tab>
                    <Tabs.Tab value="json">Advanced (JSON)</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="simple" pt="md">
                    <Stack gap="md">
                        {fields.map((field, index) => (
                            <Group key={field.id} align="flex-start">
                                <TextInput
                                    placeholder="Key"
                                    style={{ flex: 1 }}
                                    {...register(`parameters.${index}.key`)}
                                />
                                <TextInput
                                    placeholder="Value"
                                    style={{ flex: 1 }}
                                    {...register(`parameters.${index}.value`)}
                                />
                                <Button
                                    color="red"
                                    variant="light"
                                    onClick={() => remove(index)}
                                >
                                    <IconTrash size={16} />
                                </Button>
                            </Group>
                        ))}

                        <Button
                            leftSection={<IconPlus size={16} />}
                            variant="light"
                            onClick={() => append({ key: '', value: '' })}
                        >
                            Add Parameter
                        </Button>
                    </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="json" pt="md">
                    <Code block>
                        {/* TODO: Add Monaco JSON editor here */}
                        JSON Editor coming soon...
                    </Code>
                </Tabs.Panel>
            </Tabs>
        </Stack>
    )
}