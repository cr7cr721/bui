// layouts/components/Header.tsx
import {
  Group,
  Text,
  Burger,
  Drawer,
  Stack,
  Badge,
  Box,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useVersion } from '@/hooks/useApi'
import { Navigation } from './Navigation'
import { UserMenu } from './UserMenu'
import { IconDatabase } from '@tabler/icons-react'

export const Header = () => {
  const { data: version } = useVersion()
  const [opened, { toggle, close }] = useDisclosure(false)
  const theme = useMantineTheme()

  return (
    <>
      <Box
        h="100%"
        px="lg"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${theme.colors.dark[8]} 0%, ${theme.colors.dark[9]} 100%)`,
          borderBottom: `1px solid ${theme.colors.dark[6]}`,
        }}
      >
        {/* Logo & Brand */}
        <Group gap="md">
          <Box
            style={{
              width: 38,
              height: 38,
              borderRadius: theme.radius.md,
              background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.blue[8]} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 2px 8px ${theme.colors.blue[9]}40`,
            }}
          >
            <IconDatabase size={20} color="white" stroke={1.5} />
          </Box>

          <div>
            <Group gap="xs" align="center">
              <Text
                fw={600}
                size="lg"
                style={{
                  letterSpacing: '-0.02em',
                  color: theme.colors.gray[0],
                }}
              >
                BEAM Rules
              </Text>
              {version && (
                <Tooltip label={`Build: ${version}`} position="bottom" withArrow>
                  <Badge
                    size="xs"
                    variant="light"
                    color="dark"
                    style={{
                      textTransform: 'none',
                      fontWeight: 500,
                      cursor: 'default',
                    }}
                  >
                    v{version.split('-')[0]}
                  </Badge>
                </Tooltip>
              )}
            </Group>
            <Text
              size="xs"
              c="dimmed"
              style={{
                letterSpacing: '0.02em',
                marginTop: -2,
              }}
            >
              Business Rules Management
            </Text>
          </div>
        </Group>

        {/* Desktop Navigation */}
        <Group gap="sm" visibleFrom="md">
          <Navigation />
          <Box
            style={{
              width: 1,
              height: 28,
              background: theme.colors.dark[5],
              margin: '0 8px',
            }}
          />
          <UserMenu />
        </Group>

        {/* Mobile Burger */}
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="md"
          color={theme.colors.gray[4]}
          size="sm"
        />
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        title={
          <Group gap="xs">
            <IconDatabase size={18} />
            <Text fw={600}>BEAM Rules</Text>
          </Group>
        }
        position="right"
        size="280"
        hiddenFrom="md"
        styles={{
          header: {
            borderBottom: `1px solid ${theme.colors.dark[6]}`,
            paddingBottom: theme.spacing.md,
          },
          body: {
            paddingTop: theme.spacing.md,
          },
        }}
      >
        <Stack gap="lg">
          <Navigation mobile onNavigate={close} />
          <Box
            style={{
              borderTop: `1px solid ${theme.colors.dark[6]}`,
              paddingTop: theme.spacing.md,
            }}
          >
            <UserMenu />
          </Box>
        </Stack>
      </Drawer>
    </>
  )
}
