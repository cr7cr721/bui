// layouts/components/UserMenu.tsx
import {
  Group,
  Text,
  Button,
  Box,
  Menu,
  UnstyledButton,
  Avatar,
  useMantineTheme,
} from '@mantine/core'
import { useLogout, useUser } from '@/hooks/useApi'
import { useStore } from '@/store/useStore'
import { IconChevronDown, IconLogout, IconUser, IconShield } from '@tabler/icons-react'
import { useState } from 'react'

export const UserMenu = () => {
  const { data: user } = useUser()
  const token = useStore((state) => state.token)
  const setSignInModalOpen = useStore((state) => state.setSignInModalOpen)
  const logout = useLogout()
  const theme = useMantineTheme()
  const [menuOpened, setMenuOpened] = useState(false)

  const isAuthenticated = !!token

  // Generate initials from user name
  const getInitials = () => {
    if (!user) return '?'
    const first = user.firstName?.[0] || ''
    const last = user.lastName?.[0] || ''
    return (first + last).toUpperCase() || '?'
  }

  // Generate consistent color from name
  const getAvatarColor = () => {
    if (!user?.firstName) return theme.colors.gray[6]
    const colors = [
      'blue',
      'cyan',
      'teal',
      'green',
      'lime',
      'yellow',
      'orange',
      'red',
      'pink',
      'grape',
      'violet',
      'indigo',
    ]
    const index = user.firstName.charCodeAt(0) % colors.length
    return theme.colors[colors[index]][6]
  }

  if (!isAuthenticated) {
    return (
      <>
        {/* Mobile: full width */}
        <Box hiddenFrom="md">
          <Button
            onClick={() => setSignInModalOpen(true)}
            variant="filled"
            fullWidth
            radius="md"
            styles={{
              root: {
                background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.blue[7]} 100%)`,
                boxShadow: `0 2px 8px ${theme.colors.blue[9]}30`,
              },
            }}
          >
            Sign In
          </Button>
        </Box>
        {/* Desktop: auto width */}
        <Button
          onClick={() => setSignInModalOpen(true)}
          variant="filled"
          radius="md"
          visibleFrom="md"
          styles={{
            root: {
              background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.blue[7]} 100%)`,
              boxShadow: `0 2px 8px ${theme.colors.blue[9]}30`,
              transition: 'all 150ms ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${theme.colors.blue[9]}40`,
              },
            },
          }}
        >
          Sign In
        </Button>
      </>
    )
  }

  // Mobile: simple display
  const MobileUserDisplay = () => (
    <Box hiddenFrom="md">
      <Group justify="space-between" align="center">
        <Group gap="sm">
          <Avatar
            size={36}
            radius="md"
            style={{
              background: getAvatarColor(),
            }}
          >
            {getInitials()}
          </Avatar>
          <div>
            <Text size="sm" fw={600} c="gray.1">
              {user?.firstName} {user?.lastName}
            </Text>
            {user?.admin && (
              <Group gap={4}>
                <IconShield size={12} color={theme.colors.yellow[5]} />
                <Text size="xs" c="dimmed">
                  Administrator
                </Text>
              </Group>
            )}
          </div>
        </Group>
        <Button
          onClick={logout}
          variant="subtle"
          color="red"
          size="sm"
          leftSection={<IconLogout size={16} />}
        >
          Sign Out
        </Button>
      </Group>
    </Box>
  )

  // Desktop: dropdown menu
  const DesktopUserMenu = () => (
    <Menu
      opened={menuOpened}
      onChange={setMenuOpened}
      position="bottom-end"
      offset={8}
      shadow="lg"
      width={220}
      styles={{
        dropdown: {
          border: `1px solid ${theme.colors.dark[5]}`,
          background: theme.colors.dark[7],
        },
        item: {
          padding: '10px 14px',
        },
      }}
    >
      <Menu.Target>
        <UnstyledButton
          style={{
            padding: '6px 12px 6px 6px',
            borderRadius: theme.radius.md,
            background: menuOpened ? theme.colors.dark[6] : 'transparent',
            transition: 'all 150ms ease',
            '&:hover': {
              background: theme.colors.dark[6],
            },
          }}
          onMouseEnter={(e) => {
            if (!menuOpened) {
              e.currentTarget.style.background = theme.colors.dark[6]
            }
          }}
          onMouseLeave={(e) => {
            if (!menuOpened) {
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          <Group gap="xs">
            <Avatar
              size={32}
              radius="md"
              style={{
                background: getAvatarColor(),
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {getInitials()}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text
                size="sm"
                fw={500}
                c="gray.2"
                style={{
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.firstName}
              </Text>
            </div>
            <IconChevronDown
              size={14}
              color={theme.colors.gray[5]}
              style={{
                transform: menuOpened ? 'rotate(180deg)' : 'none',
                transition: 'transform 200ms ease',
              }}
            />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        {/* User Info Header */}
        <Box px="sm" py="xs" mb={4}>
          <Group gap="sm">
            <Avatar
              size={40}
              radius="md"
              style={{
                background: getAvatarColor(),
              }}
            >
              {getInitials()}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={600} c="gray.1" truncate>
                {user?.firstName} {user?.lastName}
              </Text>
              {user?.admin && (
                <Group gap={4}>
                  <IconShield size={12} color={theme.colors.yellow[5]} />
                  <Text size="xs" c="dimmed">
                    Administrator
                  </Text>
                </Group>
              )}
            </div>
          </Group>
        </Box>

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconUser size={16} stroke={1.5} />}
          disabled
          styles={{
            item: {
              opacity: 0.5,
            },
          }}
        >
          Profile Settings
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item color="red" leftSection={<IconLogout size={16} stroke={1.5} />} onClick={logout}>
          Sign Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )

  return (
    <>
      <MobileUserDisplay />
      <Box visibleFrom="md">
        <DesktopUserMenu />
      </Box>
    </>
  )
}
