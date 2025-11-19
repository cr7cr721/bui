import { useMemo } from 'react'
import { Stack, Loader, Center, Text, Alert } from '@mantine/core'
import { IconAlertCircle, IconLock } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import {
  useUser,
  useChromieRegions,
  useDisabledRegions,
  useToggleRegion
} from '@/hooks/useApi'
import { useStore } from '@/store/useStore'
import { RegionsTable } from './components/RegionsTable'

export const AdminPage = () => {
  const { isAuthenticated } = useStore()
  const { data: user, isLoading: userLoading } = useUser()
  const { data: chromieRegions, isLoading: regionsLoading, error: regionsError } = useChromieRegions()
  const { data: disabledRegions, isLoading: disabledLoading } = useDisabledRegions()
  const toggleRegionMutation = useToggleRegion()

  const userLoggedIn = isAuthenticated()
  const isAdmin = user?.admin || false

  const isLoading = userLoading || regionsLoading || disabledLoading
  const isTogglingRegion = toggleRegionMutation.isPending

  // Combine regions with their disabled status
  const regions = useMemo(() => {
    if (!chromieRegions) return []

    return chromieRegions.map(regionName => ({
      name: regionName,
      isDisabled: disabledRegions?.includes(regionName) || false
    }))
  }, [chromieRegions, disabledRegions])

  const handleToggleRegion = async (regionName: string, isCurrentlyDisabled: boolean) => {
    try {
      await toggleRegionMutation.mutateAsync({
        region: regionName,
        enable: isCurrentlyDisabled
      })

      notifications.show({
        title: 'Success',
        message: `Region ${regionName} has been ${isCurrentlyDisabled ? 'enabled' : 'disabled'}`,
        color: isCurrentlyDisabled ? 'green' : 'orange'
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update region status',
        color: 'red'
      })
    }
  }

  // Loading state
  if (isLoading) {
    return (
        <Center py={60}>
          <Stack align="center" gap="md">
            <Loader size="xl" />
            <Text c="dimmed">Loading settings...</Text>
          </Stack>
        </Center>
    )
  }

  // Not logged in
  if (!userLoggedIn) {
    return (
        <Alert
            icon={<IconLock size={16} />}
            title="Sign in required"
            color="blue"
            variant="light"
        >
          Please sign in to access settings.
        </Alert>
    )
  }

  // Not admin
  if (!isAdmin) {
    return (
        <Alert
            icon={<IconLock size={16} />}
            title="Admin access required"
            color="red"
            variant="light"
        >
          You must be an administrator to access settings.
        </Alert>
    )
  }

  // Error state
  if (regionsError) {
    return (
        <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error loading settings"
            color="red"
            variant="light"
        >
          {regionsError.message}
        </Alert>
    )
  }

  return (
      <Stack gap="lg">
        <RegionsTable
            regions={regions}
            isTogglingRegion={isTogglingRegion}
            onToggleRegion={handleToggleRegion}
        />
      </Stack>
  )
}