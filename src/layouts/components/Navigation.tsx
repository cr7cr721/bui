// layouts/components/Navigation.tsx
import { Tabs, NavLink, Stack } from '@mantine/core'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '@/hooks/useApi'
import { IconList, IconPlus, IconUsers, IconSettings } from '@tabler/icons-react'

interface NavigationProps {
    mobile?: boolean
    onNavigate?: () => void
}

const navItems = [
    { value: 'rules', path: '/', label: 'Rules', icon: IconList },
    { value: 'create', path: '/create-rule', label: 'Create Rule', icon: IconPlus },
    { value: 'groups', path: '/groups', label: 'Groups', icon: IconUsers },
    { value: 'admin', path: '/admin', label: 'Admin', icon: IconSettings, adminOnly: true },
]

export const Navigation = ({ mobile, onNavigate }: NavigationProps) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { data: user } = useUser()

    const isAdmin = !!user?.admin

    const getActiveTab = () => {
        if (location.pathname === '/' || location.pathname.startsWith('/rules')) return 'rules'
        if (location.pathname === '/create-rule') return 'create'
        if (location.pathname === '/groups') return 'groups'
        if (location.pathname === '/admin') return 'admin'
        return 'rules'
    }

    const handleNavigate = (path: string) => {
        navigate(path)
        onNavigate?.()
    }

    const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin)

    // Mobile: vertical NavLinks
    if (mobile) {
        return (
            <Stack gap="xs">
                {visibleItems.map(item => (
                    <NavLink
                        key={item.value}
                        label={item.label}
                        leftSection={<item.icon size={18} />}
                        active={getActiveTab() === item.value}
                        onClick={() => handleNavigate(item.path)}
                    />
                ))}
            </Stack>
        )
    }

    // Desktop: horizontal Tabs
    return (
        <Tabs
            value={getActiveTab()}
            onChange={(value) => {
                const item = navItems.find(i => i.value === value)
                if (item) handleNavigate(item.path)
            }}
            variant="pills"
        >
            <Tabs.List>
                {visibleItems.map(item => (
                    <Tabs.Tab
                        key={item.value}
                        value={item.value}
                        leftSection={<item.icon size={16} />}
                    >
                        {item.label}
                    </Tabs.Tab>
                ))}
            </Tabs.List>
        </Tabs>
    )
}