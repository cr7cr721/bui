import { useState, useMemo } from 'react'
import { Box, Loader, Center, Text, Alert, Flex } from '@mantine/core'
import { IconAlertCircle, IconLock } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { useRules, useUser, useMoveRulesToGroup, useDeleteRules } from '@/hooks/useApi'
import { FilterSidebar } from './components/FilterSidebar'
import { BulkActionsToolbar } from './components/BulkActionsToolbar'
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal'
import { MoveToGroupModal } from './components/MoveToGroupModal'
import { RulesTable } from './components/RulesTable'

type SortField = 'id' | 'name' | 'author' | 'group_name' | 'created' | 'updated'
type SortDirection = 'asc' | 'desc'

const SIDEBAR_WIDTH = 300

export const RulesListPage = () => {
  const { filters, isAuthenticated } = useStore()
  const { data: rules, isLoading, error } = useRules(filters.region, parseInt(filters.group))
  const { data: user } = useUser()
  const moveRulesMutation = useMoveRulesToGroup()
  const deleteRulesMutation = useDeleteRules()
  const navigate = useNavigate()

  const userLoggedIn = isAuthenticated() && !!user

  // State
  const [selectedRuleIds, setSelectedRuleIds] = useState<number[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const [targetGroup, setTargetGroup] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('updated')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  // Track if we're doing a single-rule action vs bulk
  const [singleRuleAction, setSingleRuleAction] = useState<number | null>(null)

  // Filter and sort rules
  const filteredAndSortedRules = useMemo(() => {
    const filtered =
      rules?.filter((rule) => {
        const matchesSearch =
          !filters.search ||
          rule.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          rule.id.toString().includes(filters.search)

        const matchesEnabled =
          filters.enabled === 'all' ||
          (filters.enabled === 'enabled' && rule.enabled === 1) ||
          (filters.enabled === 'disabled' && rule.enabled === 0)

        const matchesAuthor = !filters.author || rule.author === filters.author

        return matchesSearch && matchesEnabled && matchesAuthor
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
    const ruleIds = getRuleIdsForAction()
    try {
      await deleteRulesMutation.mutateAsync(ruleIds)

      notifications.show({
        title: 'Success',
        message: `${ruleIds.length} rule(s) deleted successfully`,
        color: 'green',
      })

      setSelectedRuleIds((prev) => prev.filter((id) => !ruleIds.includes(id)))
      setDeleteModalOpen(false)
      setSingleRuleAction(null)
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

    const ruleIds = getRuleIdsForAction()
    const groupName =
      user?.groups?.find((g) => g.id.toString() === targetGroup)?.fullname || targetGroup

    try {
      await moveRulesMutation.mutateAsync({
        ruleIds,
        groupId: parseInt(targetGroup),
      })

      notifications.show({
        title: 'Success',
        message: `${ruleIds.length} rule(s) moved to ${groupName}`,
        color: 'green',
      })

      setSelectedRuleIds((prev) => prev.filter((id) => !ruleIds.includes(id)))
      setMoveModalOpen(false)
      setTargetGroup(null)
      setSingleRuleAction(null)
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
    setSingleRuleAction(null)
  }

  // Single rule action handlers
  const handleEditRule = (ruleId: number) => {
    navigate(`/rules/${ruleId}`)
  }

  const handleMoveRule = (ruleId: number) => {
    setSingleRuleAction(ruleId)
    setMoveModalOpen(true)
  }

  const handleDeleteRule = (ruleId: number) => {
    setSingleRuleAction(ruleId)
    setDeleteModalOpen(true)
  }

  // Get the rule IDs to act on (single rule or selected rules)
  const getRuleIdsForAction = () => {
    return singleRuleAction ? [singleRuleAction] : selectedRuleIds
  }

  const getActionRuleCount = () => {
    return singleRuleAction ? 1 : selectedRuleIds.length
  }

  // Main content rendering
  const renderMainContent = () => {
    // Loading state
    if (isLoading) {
      return (
        <Center py={60} style={{ flex: 1 }}>
          <Box ta="center">
            <Loader size="lg" />
            <Text c="dimmed" mt="md">
              Loading rules...
            </Text>
          </Box>
        </Center>
      )
    }

    // Error state
    if (error) {
      return (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error loading rules"
          color="red"
          variant="light"
        >
          {error.message}
        </Alert>
      )
    }

    // Main table
    return (
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mantine-spacing-md)' }}>
        {userLoggedIn && (
          <BulkActionsToolbar
            selectedCount={selectedRuleIds.length}
            onClearSelection={handleClearSelection}
            onMoveToGroup={() => setMoveModalOpen(true)}
            onDelete={() => setDeleteModalOpen(true)}
          />
        )}

        {!userLoggedIn && (
          <Alert
            icon={<IconLock size={16} />}
            title="Sign in required"
            color="blue"
            variant="light"
          >
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
          onEditRule={handleEditRule}
          onMoveRule={handleMoveRule}
          onDeleteRule={handleDeleteRule}
        />
      </Box>
    )
  }

  return (
    <Box
      style={{
        display: 'flex',
        gap: 'var(--mantine-spacing-lg)',
        minHeight: 'calc(100vh - 120px)',
      }}
    >
      {/* Left Sidebar */}
      <Box
        component="aside"
        w={SIDEBAR_WIDTH}
        style={{
          flexShrink: 0,
          position: 'sticky',
          top: 'var(--mantine-spacing-md)',
          alignSelf: 'flex-start',
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
        }}
        visibleFrom="md"
      >
        <FilterSidebar
          totalRules={rules?.length || 0}
          filteredRules={filteredAndSortedRules.length}
        />
      </Box>

      {/* Mobile Filters - shown above content on small screens */}
      <Box hiddenFrom="md" w="100%">
        <Flex direction="column" gap="lg">
          <FilterSidebar
            totalRules={rules?.length || 0}
            filteredRules={filteredAndSortedRules.length}
            mobile
          />
          {renderMainContent()}
        </Flex>
      </Box>

      {/* Main Content Area - Desktop */}
      <Box style={{ flex: 1, minWidth: 0 }} visibleFrom="md">
        {renderMainContent()}
      </Box>

      {/* Modals */}
      <DeleteConfirmationModal
        opened={deleteModalOpen}
        ruleCount={getActionRuleCount()}
        isDeleting={deleteRulesMutation.isPending}
        onClose={() => {
          setDeleteModalOpen(false)
          setSingleRuleAction(null)
        }}
        onConfirm={handleDeleteSelected}
      />

      <MoveToGroupModal
        opened={moveModalOpen}
        ruleCount={getActionRuleCount()}
        groups={user?.groups || []}
        selectedGroup={targetGroup}
        isMoving={moveRulesMutation.isPending}
        onClose={handleCloseMoveModal}
        onGroupChange={setTargetGroup}
        onConfirm={handleMoveToGroup}
      />
    </Box>
  )
}
