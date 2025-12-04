// layouts/components/Header.tsx
import { Group, Title, Text, Burger, Drawer, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useVersion } from '@/hooks/useApi'
import { Navigation } from './Navigation'
import { UserMenu } from './UserMenu'

export const Header = () => {
  const { data: version } = useVersion()
  const [opened, { toggle, close }] = useDisclosure(false)

  return (
    <>
      <Group h="100%" px="md" justify="space-between">
        <div>
          <Title order={3}>BEAM Rules Dashboard</Title>
          {version && (
            <Text size="xs" c="dimmed">
              Version: {version}
            </Text>
          )}
        </div>

        {/* Desktop Navigation */}
        <Group gap="xl" visibleFrom="md">
          <Navigation />
          <UserMenu />
        </Group>

        {/* Mobile Burger */}
        <Burger opened={opened} onClick={toggle} hiddenFrom="md" />
      </Group>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        title="Menu"
        position="right"
        size="xs"
        hiddenFrom="md"
      >
        <Stack gap="lg">
          <Navigation mobile onNavigate={close} />
          <UserMenu />
        </Stack>
      </Drawer>
    </>
  )
}
