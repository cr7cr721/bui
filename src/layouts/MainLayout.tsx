import { AppShell, Group, Title, Text, Button, Tabs } from '@mantine/core'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useVersion } from '@/hooks/useApi'
import { useLogout } from '@/hooks/useAuth'
import { useStore } from '@/store/useStore'
import { SignInModal } from '@/components/SignInModal/SignInModal'
import { IconList, IconPlus, IconUsers, IconSettings } from '@tabler/icons-react'  // ← Add IconUsers

export const MainLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { data: version } = useVersion()
    const logoutMutation = useLogout()
    const {
        isAuthenticated,
        isSignInModalOpen,
        setSignInModalOpen,
        clearAuth
    } = useStore()

    const handleSignOut = () => {
        logoutMutation.mutate(undefined, {
            onSuccess: () => {
                clearAuth()
            }
        })
    }

    const authenticated = isAuthenticated()

    const getActiveTab = () => {
        if (location.pathname === '/' || location.pathname.startsWith('/rules')) return 'rules'
        if (location.pathname === '/create-rule') return 'create'
        if (location.pathname === '/groups') return 'groups'  // ← Add groups
        if (location.pathname === '/settings') return 'settings'
        return 'rules'
    }

    return (
        <>
            <AppShell header={{ height: 70 }} padding="md">
                <AppShell.Header>
                    <Group h="100%" px="md" justify="space-between">
                        <div>
                            <Title order={3}>BEAM Rules Dashboard</Title>
                            {version && (
                                <Text size="xs" c="dimmed">Version: {version}</Text>
                            )}
                        </div>

                        <Group gap="xl">
                            <Tabs
                                value={getActiveTab()}
                                onChange={(value) => {
                                    if (value === 'rules') navigate('/')
                                    if (value === 'create') navigate('/create-rule')
                                    if (value === 'groups') navigate('/groups')  // ← Add groups
                                    if (value === 'settings') navigate('/settings')
                                }}
                                variant="pills"
                            >
                                <Tabs.List>
                                    <Tabs.Tab
                                        value="rules"
                                        leftSection={<IconList size={16} />}
                                    >
                                        Rules
                                    </Tabs.Tab>
                                    <Tabs.Tab
                                        value="create"
                                        leftSection={<IconPlus size={16} />}
                                    >
                                        Create Rule
                                    </Tabs.Tab>
                                    <Tabs.Tab
                                        value="groups"
                                        leftSection={<IconUsers size={16} />}  // ← Add Groups tab
                                    >
                                        Groups
                                    </Tabs.Tab>
                                    <Tabs.Tab
                                        value="settings"
                                        leftSection={<IconSettings size={16} />}
                                    >
                                        Settings
                                    </Tabs.Tab>
                                </Tabs.List>
                            </Tabs>

                            {authenticated ? (
                                <Button
                                    onClick={handleSignOut}
                                    loading={logoutMutation.isPending}
                                    variant="subtle"
                                    color="red"
                                >
                                    Sign Out
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setSignInModalOpen(true)}
                                    variant="filled"
                                >
                                    Sign In
                                </Button>
                            )}
                        </Group>
                    </Group>
                </AppShell.Header>

                <AppShell.Main>
                    <Outlet />
                </AppShell.Main>
            </AppShell>

            <SignInModal
                isOpen={isSignInModalOpen}
                onClose={() => setSignInModalOpen(false)}
            />
        </>
    )
}