import { useState, useMemo } from 'react'
import {
    Stack,
    Paper,
    Title,
    Loader,
    Center,
    Text,
    Badge,
    Group,
    Alert,
    Checkbox,
    Button,
    Modal,
    Select,
    Table,
    Anchor,
    Tooltip
} from '@mantine/core'
import { useStore } from '@/store/useStore'
import { useRules, useUser } from '@/hooks/useApi'
import { RulesFilters } from "@/components/RulesFilters/RulesFilters"
import { Link } from 'react-router-dom'
import {
    IconAlertCircle,
    IconTrash,
    IconFolders,
    IconX,
    IconChevronUp,
    IconChevronDown,
    IconSelector
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'

type SortField = 'name' | 'author' | 'group_name' | 'version' | 'created' | 'updated' | 'trigger_count'
type SortDirection = 'asc' | 'desc'

export const RulesListPage = () => {
    const { filters } = useStore()
    const { data: rules, isLoading, error, refetch } = useRules(filters.region, parseInt(filters.group))
    const { data: user } = useUser()

    // Selection state
    const [selectedRuleIds, setSelectedRuleIds] = useState<number[]>([])
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [moveModalOpen, setMoveModalOpen] = useState(false)
    const [targetGroup, setTargetGroup] = useState<string | null>(null)

    // Sorting state
    const [sortField, setSortField] = useState<SortField>('updated')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

    // Filter and sort rules
    const filteredAndSortedRules = useMemo(() => {
        const filtered = rules?.filter(rule => {
            const matchesSearch = !filters.search ||
                rule.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                rule.author.toLowerCase().includes(filters.search.toLowerCase())

            const matchesEnabled = filters.enabled === 'all' ||
                (filters.enabled === 'enabled' && rule.enabled === 1) ||
                (filters.enabled === 'disabled' && rule.enabled === 0)

            return matchesSearch && matchesEnabled
        }) || []

        // Sort
        return [...filtered].sort((a, b) => {
            let aVal = a[sortField]
            let bVal = b[sortField]

            // Handle different types
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                aVal = aVal.toLowerCase()
                bVal = bVal.toLowerCase()
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
            return 0
        })
    }, [rules, filters, sortField, sortDirection])

    // Select/Deselect all
    const allSelected = filteredAndSortedRules.length > 0 && selectedRuleIds.length === filteredAndSortedRules.length
    const someSelected = selectedRuleIds.length > 0 && selectedRuleIds.length < filteredAndSortedRules.length

    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedRuleIds([])
        } else {
            setSelectedRuleIds(filteredAndSortedRules.map(rule => rule.id))
        }
    }

    const handleSelectRule = (ruleId: number) => {
        setSelectedRuleIds(prev => {
            if (prev.includes(ruleId)) {
                return prev.filter(id => id !== ruleId)
            } else {
                return [...prev, ruleId]
            }
        })
    }

    const handleClearSelection = () => {
        setSelectedRuleIds([])
    }

    // Handle sort
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <IconSelector size={14} />
        return sortDirection === 'asc'
            ? <IconChevronUp size={14} />
            : <IconChevronDown size={14} />
    }

    // Delete selected rules
    const handleDeleteSelected = async () => {
        try {
            console.log('Deleting rules:', selectedRuleIds)
            // TODO: Call API to delete rules
            // await apiClient.deleteRules(selectedRuleIds)

            notifications.show({
                title: 'Success',
                message: `${selectedRuleIds.length} rule(s) deleted successfully`,
                color: 'green'
            })

            setSelectedRuleIds([])
            setDeleteModalOpen(false)
            await refetch()
        } catch (_error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to delete rules',
                color: 'red'
            })
        }
    }

    // Move selected rules to another group
    const handleMoveToGroup = async () => {
        if (!targetGroup) {
            notifications.show({
                message: 'Please select a target group',
                color: 'orange'
            })
            return
        }

        try {
            console.log('Moving rules:', selectedRuleIds, 'to group:', targetGroup)
            // TODO: Call API to move rules
            // await apiClient.moveRules(selectedRuleIds, parseInt(targetGroup))

            // Find group name for notification
            const groupName = user?.groups?.find(g => g.id.toString() === targetGroup)?.fullname || targetGroup

            notifications.show({
                title: 'Success',
                message: `${selectedRuleIds.length} rule(s) moved to ${groupName}`,
                color: 'green'
            })

            setSelectedRuleIds([])
            setMoveModalOpen(false)
            setTargetGroup(null)
            await refetch()
        } catch (_error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to move rules',
                color: 'red'
            })
        }
    }

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

            {/* Bulk Actions Toolbar - Always Visible */}
            <Paper
                p="md"
                withBorder
                style={{
                    backgroundColor: selectedRuleIds.length > 0
                        ? 'var(--mantine-color-blue-9)'
                        : 'var(--mantine-color-dark-6)',
                    transition: 'background-color 0.2s'
                }}
            >
                <Group justify="space-between">
                    <Group>
                        {selectedRuleIds.length > 0 ? (
                            <>
                                <Text fw={500}>
                                    {selectedRuleIds.length} rule{selectedRuleIds.length !== 1 ? 's' : ''} selected
                                </Text>
                                <Button
                                    variant="subtle"
                                    size="xs"
                                    onClick={handleClearSelection}
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
                            onClick={() => setMoveModalOpen(true)}
                            disabled={selectedRuleIds.length === 0}
                        >
                            Move to Group
                        </Button>
                        <Button
                            variant="light"
                            color="red"
                            leftSection={<IconTrash size={16} />}
                            onClick={() => setDeleteModalOpen(true)}
                            disabled={selectedRuleIds.length === 0}
                        >
                            Delete
                        </Button>
                    </Group>
                </Group>
            </Paper>

            {/* Rules Table */}
            <Paper shadow="sm" withBorder>
                <Group p="md" justify="space-between" style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
                    <Title order={3}>
                        Rules ({filteredAndSortedRules.length})
                    </Title>
                </Group>

                {filteredAndSortedRules.length === 0 ? (
                    <Center py={60}>
                        <Text c="dimmed">No rules found matching your filters.</Text>
                    </Center>
                ) : (
                    <Table.ScrollContainer minWidth={800}>
                        <Table highlightOnHover striped verticalSpacing="sm">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th style={{ width: 40 }}>
                                        <Checkbox
                                            checked={allSelected}
                                            indeterminate={someSelected}
                                            onChange={handleSelectAll}
                                        />
                                    </Table.Th>
                                    <Table.Th
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleSort('name')}
                                    >
                                        <Group gap={4}>
                                            <Text fw={600}>Name</Text>
                                            {getSortIcon('name')}
                                        </Group>
                                    </Table.Th>
                                    <Table.Th style={{ width: 100 }}>Status</Table.Th>
                                    <Table.Th
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleSort('author')}
                                    >
                                        <Group gap={4}>
                                            <Text fw={600}>Author</Text>
                                            {getSortIcon('author')}
                                        </Group>
                                    </Table.Th>
                                    <Table.Th
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleSort('group_name')}
                                    >
                                        <Group gap={4}>
                                            <Text fw={600}>Group</Text>
                                            {getSortIcon('group_name')}
                                        </Group>
                                    </Table.Th>
                                    <Table.Th>Regions</Table.Th>
                                    <Table.Th
                                        style={{ cursor: 'pointer', userSelect: 'none', width: 80 }}
                                        onClick={() => handleSort('version')}
                                    >
                                        <Group gap={4}>
                                            <Text fw={600}>Ver</Text>
                                            {getSortIcon('version')}
                                        </Group>
                                    </Table.Th>
                                    <Table.Th
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleSort('trigger_count')}
                                    >
                                        <Group gap={4}>
                                            <Text fw={600}>Triggers</Text>
                                            {getSortIcon('trigger_count')}
                                        </Group>
                                    </Table.Th>
                                    <Table.Th
                                        style={{ cursor: 'pointer', userSelect: 'none' }}
                                        onClick={() => handleSort('updated')}
                                    >
                                        <Group gap={4}>
                                            <Text fw={600}>Updated</Text>
                                            {getSortIcon('updated')}
                                        </Group>
                                    </Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filteredAndSortedRules.map((rule) => (
                                    <Table.Tr
                                        key={rule.id}
                                        style={{
                                            backgroundColor: selectedRuleIds.includes(rule.id)
                                                ? 'var(--mantine-color-blue-9)'
                                                : undefined,
                                        }}
                                    >
                                        <Table.Td>
                                            <Checkbox
                                                checked={selectedRuleIds.includes(rule.id)}
                                                onChange={() => handleSelectRule(rule.id)}
                                            />
                                        </Table.Td>
                                        <Table.Td>
                                            <Anchor
                                                component={Link}
                                                to={`/rules/${rule.id}`}
                                                fw={500}
                                            >
                                                {rule.name}
                                            </Anchor>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge
                                                color={rule.enabled ? 'green' : 'red'}
                                                variant="light"
                                                size="sm"
                                            >
                                                {rule.enabled ? 'Enabled' : 'Disabled'}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c="dimmed">{rule.author}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{rule.group_name}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap={4}>
                                                {rule.regions.map((region) => (
                                                    <Badge key={region} variant="dot" size="sm">
                                                        {region}
                                                    </Badge>
                                                ))}
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{rule.version}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{rule.trigger_count}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Tooltip label={new Date(rule.updated * 1000).toLocaleString()}>
                                                <Text size="sm" c="dimmed">
                                                    {new Date(rule.updated * 1000).toLocaleDateString()}
                                                </Text>
                                            </Tooltip>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                )}
            </Paper>

            {/* Delete Confirmation Modal */}
            <Modal
                opened={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Rules"
                centered
            >
                <Stack>
                    <Alert color="red" icon={<IconAlertCircle size={16} />}>
                        Are you sure you want to delete {selectedRuleIds.length} rule
                        {selectedRuleIds.length !== 1 ? 's' : ''}? This action cannot be undone.
                    </Alert>

                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={handleDeleteSelected}>
                            Delete {selectedRuleIds.length} Rule{selectedRuleIds.length !== 1 ? 's' : ''}
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Move to Group Modal */}
            <Modal
                opened={moveModalOpen}
                onClose={() => {
                    setMoveModalOpen(false)
                    setTargetGroup(null)
                }}
                title="Move Rules to Group"
                centered
            >
                <Stack>
                    <Text size="sm" c="dimmed">
                        Move {selectedRuleIds.length} rule{selectedRuleIds.length !== 1 ? 's' : ''} to a
                        different group
                    </Text>

                    <Select
                        label="Target Group"
                        placeholder="Select group"
                        data={user?.groups?.map((group) => ({
                            value: group.id.toString(),
                            label: group.fullname
                        })) || []}
                        value={targetGroup}
                        onChange={setTargetGroup}
                        required
                        searchable
                        nothingFoundMessage="No groups found"
                    />

                    <Group justify="flex-end">
                        <Button
                            variant="default"
                            onClick={() => {
                                setMoveModalOpen(false)
                                setTargetGroup(null)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleMoveToGroup}
                            disabled={!targetGroup}
                        >
                            Move Rules
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    )
}