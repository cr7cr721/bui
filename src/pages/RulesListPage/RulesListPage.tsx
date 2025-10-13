import { Stack, Paper, Title, Loader, Center, Text, Badge, Group, SimpleGrid, Anchor, Alert } from '@mantine/core'
import { useStore } from '../../store/useStore'
import { useRules } from '../../hooks/useApi'
import { RulesFilters } from "../../components/RulesFilters/RulesFilters"
import { Link } from 'react-router-dom'
import { IconAlertCircle } from '@tabler/icons-react'

export const RulesListPage = () => {
    const { filters } = useStore()
    const { data: rules, isLoading, error } = useRules(filters.region, parseInt(filters.group))

    const filteredRules = rules?.filter(rule => {
        const matchesSearch = !filters.search ||
            rule.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            rule.author.toLowerCase().includes(filters.search.toLowerCase())

        const matchesEnabled = filters.enabled === 'all' ||
            (filters.enabled === 'enabled' && rule.enabled === 1) ||
            (filters.enabled === 'disabled' && rule.enabled === 0)

        return matchesSearch && matchesEnabled
    })

    if (isLoading) {
        return (
            <Stack gap="lg">
                <RulesFilters />
                <Center py={60}>
                    <Stack align="center" gap="md">
                        <Loader size="xl" />
                        <Text c="dimmed">Loading rules...</Text>
                    </Stack>
                </Center>
            </Stack>
        )
    }

    if (error) {
        return (
            <Stack gap="lg">
                <RulesFilters />
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Error loading rules"
                    color="red"
                    variant="light"
                >
                    {error.message}
                </Alert>
            </Stack>
        )
    }

    return (
        <Stack gap="lg">
            <RulesFilters />

            <Paper shadow="sm" withBorder>
                <Group p="md" style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
                    <Title order={3}>
                        Rules ({filteredRules?.length || 0})
                    </Title>
                </Group>

                <Stack gap={0}>
                    {filteredRules?.map((rule) => (
                        <Paper
                            key={rule.id}
                            p="lg"
                            style={(theme) => ({
                                borderBottom: `1px solid ${theme.colors.dark[4]}`,
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                    backgroundColor: theme.colors.dark[6]
                                }
                            })}
                        >
                            <Stack gap="sm">
                                <Group>
                                    <Anchor
                                        component={Link}
                                        to={`/rules/${rule.id}`}
                                        size="lg"
                                        fw={500}
                                    >
                                        {rule.name}
                                    </Anchor>
                                    <Badge
                                        color={rule.enabled ? 'green' : 'red'}
                                        variant="light"
                                    >
                                        {rule.enabled ? 'Enabled' : 'Disabled'}
                                    </Badge>
                                </Group>

                                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
                                    <Text size="sm" c="dimmed">
                                        <Text span fw={500} c="white">Author:</Text> {rule.author}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        <Text span fw={500} c="white">Group:</Text> {rule.group_name}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        <Text span fw={500} c="white">Version:</Text> {rule.version}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        <Text span fw={500} c="white">Created:</Text> {new Date(rule.created * 1000).toLocaleDateString()}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        <Text span fw={500} c="white">Updated:</Text> {new Date(rule.updated * 1000).toLocaleDateString()}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        <Text span fw={500} c="white">Triggers:</Text> {rule.trigger_count}
                                    </Text>
                                </SimpleGrid>

                                <div>
                                    <Text size="sm" fw={500} mb={4}>Regions:</Text>
                                    <Group gap="xs">
                                        {rule.regions.map((region) => (
                                            <Badge key={region} variant="dot" size="sm">
                                                {region}
                                            </Badge>
                                        ))}
                                    </Group>
                                </div>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>

                {filteredRules?.length === 0 && (
                    <Center py={60}>
                        <Text c="dimmed">No rules found matching your filters.</Text>
                    </Center>
                )}
            </Paper>
        </Stack>
    )
}