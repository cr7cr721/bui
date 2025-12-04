import { useState, useMemo } from 'react'
import { Stack, Loader, Center, Text, Alert } from '@mantine/core'
import { IconAlertCircle, IconLock } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useStore } from '@/store/useStore'
import { useRules, useUser, useMoveRulesToGroup, useDeleteRules } from '@/hooks/useApi'
import { RulesFilters } from './components/RulesFilters.tsx'
import { BulkActionsToolbar } from './components/BulkActionsToolbar'
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal'
import { MoveToGroupModal } from './components/MoveToGroupModal'
import { RulesTable } from './components/RulesTable'

type SortField =
  | 'name'
  | 'author'
  | 'group_name'
  | 'version'
  | 'created'
  | 'updated'
  | 'trigger_count'
type SortDirection = 'asc' | 'desc'

export const RulesListPage = () => {
  const { filters, isAuthenticated } = useStore()
  const { data: rules, isLoading, error } = useRules(filters.region, parseInt(filters.group))
  const { data: user } = useUser()
  const moveRulesMutation = useMoveRulesToGroup()
  const deleteRulesMutation = useDeleteRules()

  const userLoggedIn = isAuthenticated() && !!user

  // State
  const [selectedRuleIds, setSelectedRuleIds] = useState<number[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const [targetGroup, setTargetGroup] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('updated')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Filter and sort rules
  const filteredAndSortedRules = useMemo(() => {
    const filtered =
      rules?.filter((rule) => {
        const matchesSearch =
          !filters.search ||
          rule.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          rule.author.toLowerCase().includes(filters.search.toLowerCase())

        const matchesEnabled =
          filters.enabled === 'all' ||
          (filters.enabled === 'enabled' && rule.enabled === 1) ||
          (filters.enabled === 'disabled' && rule.enabled === 0)

        return matchesSearch && matchesEnabled
      }) || []

    return [...filtered].sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [rules, filters, sortField, sortDirection])

  // Handlers
  const handleSelectAll = () => {
    if (!userLoggedIn) {
      notifications.show({
        message: 'Please sign in to select rules',
        color: 'orange',
        icon: <IconLock size={16} />,
      })
      return
    }

    if (selectedRuleIds.length === filteredAndSortedRules.length) {
      setSelectedRuleIds([])
    } else {
      setSelectedRuleIds(filteredAndSortedRules.map((rule) => rule.id))
    }
  }

  const handleSelectRule = (ruleId: number) => {
    if (!userLoggedIn) {
      notifications.show({
        message: 'Please sign in to select rules',
        color: 'orange',
        icon: <IconLock size={16} />,
      })
      return
    }

    setSelectedRuleIds((prev) =>
      prev.includes(ruleId) ? prev.filter((id) => id !== ruleId) : [...prev, ruleId]
    )
  }

  const handleClearSelection = () => setSelectedRuleIds([])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleDeleteSelected = async () => {
    try {
      await deleteRulesMutation.mutateAsync(selectedRuleIds)

      notifications.show({
        title: 'Success',
        message: `${selectedRuleIds.length} rule(s) deleted successfully`,
        color: 'green',
      })

      setSelectedRuleIds([])
      setDeleteModalOpen(false)
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete rules',
        color: 'red',
      })
    }
  }

  const handleMoveToGroup = async () => {
    if (!targetGroup) {
      notifications.show({
        message: 'Please select a target group',
        color: 'orange',
      })
      return
    }

    const groupName =
      user?.groups?.find((g) => g.id.toString() === targetGroup)?.fullname || targetGroup

    try {
      await moveRulesMutation.mutateAsync({
        ruleIds: selectedRuleIds,
        groupId: parseInt(targetGroup),
      })

      notifications.show({
        title: 'Success',
        message: `${selectedRuleIds.length} rule(s) moved to ${groupName}`,
        color: 'green',
      })

      setSelectedRuleIds([])
      setMoveModalOpen(false)
      setTargetGroup(null)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to move rules',
        color: 'red',
      })
    }
  }

  const handleCloseMoveModal = () => {
    setMoveModalOpen(false)
    setTargetGroup(null)
  }

  // Loading state
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

  // Error state
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

  // Main render
  return (
    <Stack gap="lg">
      <RulesFilters />

      {userLoggedIn && (
        <BulkActionsToolbar
          selectedCount={selectedRuleIds.length}
          onClearSelection={handleClearSelection}
          onMoveToGroup={() => setMoveModalOpen(true)}
          onDelete={() => setDeleteModalOpen(true)}
        />
      )}

      {!userLoggedIn && (
        <Alert icon={<IconLock size={16} />} title="Sign in required" color="blue" variant="light">
          Sign in to select and manage rules using bulk operations.
        </Alert>
      )}

      <RulesTable
        rules={filteredAndSortedRules}
        selectedRuleIds={selectedRuleIds}
        showCheckbox={userLoggedIn}
        sortField={sortField}
        sortDirection={sortDirection}
        onSelectAll={handleSelectAll}
        onSelectRule={handleSelectRule}
        onSort={handleSort}
      />

      <DeleteConfirmationModal
        opened={deleteModalOpen}
        ruleCount={selectedRuleIds.length}
        isDeleting={deleteRulesMutation.isPending}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteSelected}
      />

      <MoveToGroupModal
        opened={moveModalOpen}
        ruleCount={selectedRuleIds.length}
        groups={user?.groups || []}
        selectedGroup={targetGroup}
        isMoving={moveRulesMutation.isPending}
        onClose={handleCloseMoveModal}
        onGroupChange={setTargetGroup}
        onConfirm={handleMoveToGroup}
      />
    </Stack>
  )
}
