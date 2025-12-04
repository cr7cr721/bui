// components/SignInModal/SignInModal.tsx
import { useEffect } from 'react'
import { Modal, TextInput, PasswordInput, Button, Stack, Alert, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { useUser, useLogin } from '@/hooks/useApi'
import type { LoginCredentials } from '@/services'

const WELCOME_DISPLAY_MS = 1500

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const { data: user, isLoading: isLoadingUser } = useUser()
  const loginMutation = useLogin()

  const form = useForm<LoginCredentials>({
    initialValues: {
      user: '',
      password: '',
    },
    validate: {
      user: (value) => (!value ? 'Username is required' : null),
      password: (value) => (!value ? 'Password is required' : null),
    },
  })

  const isLoading = loginMutation.isPending || (loginMutation.isSuccess && isLoadingUser)
  const showWelcome = loginMutation.isSuccess && user

  useEffect(() => {
    if (!showWelcome) return

    const timer = setTimeout(() => {
      form.reset()
      loginMutation.reset()
      onClose()
    }, WELCOME_DISPLAY_MS)

    return () => clearTimeout(timer)
  }, [showWelcome, form, loginMutation, onClose])

  const handleClose = () => {
    form.reset()
    loginMutation.reset()
    onClose()
  }

  const getButtonText = () => {
    if (loginMutation.isPending) return 'Signing in...'
    if (isLoadingUser) return 'Loading profile...'
    return 'Sign In'
  }

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={showWelcome ? 'Success' : 'Sign In'}
      centered
      size="md"
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
    >
      {showWelcome ? (
        <Stack gap="md" align="center" py="md">
          <IconCheck size={48} color="var(--mantine-color-green-6)" />
          <Text size="lg" fw={500}>
            Welcome, {user.firstName}!
          </Text>
        </Stack>
      ) : (
        <form onSubmit={form.onSubmit((values) => loginMutation.mutate(values))}>
          <Stack gap="md">
            <TextInput
              label="Username"
              placeholder="Enter your username"
              {...form.getInputProps('user')}
              autoComplete="username"
              disabled={isLoading}
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              {...form.getInputProps('password')}
              autoComplete="current-password"
              disabled={isLoading}
            />

            {loginMutation.error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                {loginMutation.error.message}
              </Alert>
            )}

            <Button type="submit" fullWidth loading={isLoading}>
              {getButtonText()}
            </Button>
          </Stack>
        </form>
      )}
    </Modal>
  )
}
