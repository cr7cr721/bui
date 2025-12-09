// layouts/components/Navigation.tsx
import { Group, NavLink, Stack, UnstyledButton, Text, useMantineTheme, Box } from '@mantine/core'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '@/hooks/useApi'
import { IconList, IconPlus, IconUsers, IconSettings } from '@tabler/icons-react'
import { useState } from 'react'

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

interface NavButtonProps {
  item: (typeof navItems)[0]
  isActive: boolean
  onClick: () => void
}

const NavButton = ({ item, isActive, onClick }: NavButtonProps) => {
  const theme = useMantineTheme()
  const [hovered, setHovered] = useState(false)
  const Icon = item.icon

  return (
    <UnstyledButton
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '8px 14px',
        borderRadius: theme.radius.md,
        background: isActive
          ? theme.colors.blue[6]
          : hovered
            ? theme.colors.dark[6]
            : 'transparent',
        transition: 'all 150ms ease',
        transform: hovered && !isActive ? 'translateY(-1px)' : 'none',
      }}
    >
      <Group gap={8} wrap="nowrap">
        <Icon
          size={16}
          stroke={1.5}
          style={{
            color: isActive ? 'white' : hovered ? theme.colors.gray[2] : theme.colors.gray[5],
            transition: 'color 150ms ease',
          }}
        />
        <Text
          size="sm"
          fw={isActive ? 600 : 500}
          style={{
            color: isActive ? 'white' : hovered ? theme.colors.gray[2] : theme.colors.gray[4],
            transition: 'color 150ms ease',
            whiteSpace: 'nowrap',
          }}
        >
          {item.label}
        </Text>
      </Group>
    </UnstyledButton>
  )
}

export const Navigation = ({ mobile, onNavigate }: NavigationProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: user } = useUser()
  const theme = useMantineTheme()

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

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  // Mobile: enhanced vertical NavLinks
  if (mobile) {
    return (
      <Stack gap={4}>
        {visibleItems.map((item) => (
          <NavLink
            key={item.value}
            label={item.label}
            leftSection={<item.icon size={18} stroke={1.5} />}
            active={getActiveTab() === item.value}
            onClick={() => handleNavigate(item.path)}
            styles={{
              root: {
                borderRadius: theme.radius.md,
                fontWeight: 500,
              },
              label: {
                fontWeight: getActiveTab() === item.value ? 600 : 500,
              },
            }}
          />
        ))}
      </Stack>
    )
  }

  // Desktop: custom pill navigation
  return (
    <Box
      style={{
        background: theme.colors.dark[7],
        borderRadius: theme.radius.lg,
        padding: 4,
      }}
    >
      <Group gap={4}>
        {visibleItems.map((item) => (
          <NavButton
            key={item.value}
            item={item}
            isActive={getActiveTab() === item.value}
            onClick={() => handleNavigate(item.path)}
          />
        ))}
      </Group>
    </Box>
  )
}
