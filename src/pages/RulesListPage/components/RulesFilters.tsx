import { Paper, Title, Grid, Select, TextInput, Group, Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useStore } from '@/store/useStore.ts'
import { useUser, useRegions } from '@/hooks/useApi.ts'
import type { RuleFilters } from '@/types/api.ts'
import { IconSearch, IconFilter, IconFilterOff } from '@tabler/icons-react'

export const RulesFilters = () => {
    const { filters, setFilters, resetFilters } = useStore()
    const { data: user } = useUser()
    const { data: regions } = useRegions()

    const form = useForm<RuleFilters>({
        initialValues: filters,
    })

    const handleSubmit = (values: RuleFilters) => {
        setFilters(values)
    }

    const handleReset = () => {
        resetFilters()
        form.setValues(filters)
    }

    return (
        <Paper shadow="sm" p="lg" withBorder>
            <Title order={4} mb="md">Filter Rules</Title>

            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Select
                            label="Region"
                            placeholder="Select region"
                            data={regions?.map((region) => ({
                                value: region.name,
                                label: `${region.name} - ${region.description}`
                            })) || []}
                            {...form.getInputProps('region')}
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Select
                            label="Group"
                            placeholder="Select group"
                            data={user?.groups?.map((group) => ({
                                value: group.id.toString(),
                                label: group.fullname
                            })) || []}
                            {...form.getInputProps('group')}
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Select
                            label="Status"
                            placeholder="Select status"
                            data={[
                                { value: 'all', label: 'All Rules' },
                                { value: 'enabled', label: 'Enabled Only' },
                                { value: 'disabled', label: 'Disabled Only' }
                            ]}
                            {...form.getInputProps('enabled')}
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <TextInput
                            label="Search"
                            placeholder="Search rules..."
                            leftSection={<IconSearch size={16} />}
                            {...form.getInputProps('search')}
                        />
                    </Grid.Col>
                </Grid>

                <Group mt="md" gap="sm">
                    <Button
                        type="submit"
                        leftSection={<IconFilter size={16} />}
                    >
                        Apply Filters
                    </Button>
                    <Button
                        type="button"
                        variant="light"
                        color="gray"
                        onClick={handleReset}
                        leftSection={<IconFilterOff size={16} />}
                    >
                        Reset
                    </Button>
                </Group>
            </form>
        </Paper>
    )
}