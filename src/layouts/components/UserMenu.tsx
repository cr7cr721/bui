// layouts/components/UserMenu.tsx
import { Group, Text, Button, Divider, Box } from '@mantine/core'
import { useUser } from '@/hooks/useApi'
import { useStore } from '@/store/useStore'
import { useLogout } from '@/hooks/useApi/useAuth'

export const UserMenu = () => {
    const { data: user } = useUser()
    const token = useStore((state) => state.token)
    const setSignInModalOpen = useStore((state) => state.setSignInModalOpen)
    const logout = useLogout()

    const isAuthenticated = !!token

    if (!isAuthenticated) {
        return (
            <>
                {/* Mobile: full width */}
                <Box hiddenFrom="md">
                    <Button onClick={() => setSignInModalOpen(true)} variant="filled" fullWidth>
                        Sign In
                    </Button>
                </Box>
                {/* Desktop: auto width */}
                <Button onClick={() => setSignInModalOpen(true)} variant="filled" visibleFrom="md">
                    Sign In
                </Button>
            </>
        )
    }

    return (
        <>
            <Divider hiddenFrom="md" />
            <Group gap="sm" justify="space-between">
                {user && <Text size="sm">Welcome, {user.firstName}</Text>}
                <Button onClick={logout} variant="subtle" color="red">
                    Sign Out
                </Button>
            </Group>
        </>
    )
}