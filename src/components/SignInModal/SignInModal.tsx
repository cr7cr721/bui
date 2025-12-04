// components/SignInModal/SignInModal.tsx
import { useEffect } from 'react'
import { Modal, TextInput, PasswordInput, Button, Stack, Alert, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useStore } from '@/store/useStore'
import { authService } from '@/services'
import type { LoginCredentials } from '@/services'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { useUser } from '@/hooks/useApi'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const setToken = useStore((state) => state.setToken)
  const queryClient = useQueryClient()

  const { data: user, isLoading: isLoadingUser } = useUser()

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setToken(data.token)
      // Invalidate to trigger fresh user fetch
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

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

  // Close modal after user data is loaded
  useEffect(() => {
    if (loginMutation.isSuccess && user) {
      const timer = setTimeout(() => {
        form.reset()
        loginMutation.reset()
        onClose()
      }, 1500) // Show welcome message for 1.5 seconds
      return () => clearTimeout(timer)
    }
  }, [loginMutation.isSuccess, user])

  const handleSubmit = (values: LoginCredentials) => {
    loginMutation.mutate(values)
  }

  const handleClose = () => {
    form.reset()
    loginMutation.reset()
    onClose()
  }

  const isLoading = loginMutation.isPending || (loginMutation.isSuccess && isLoadingUser)
  const showWelcome = loginMutation.isSuccess && user

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
        <form onSubmit={form.onSubmit(handleSubmit)}>
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
              {loginMutation.isPending
                ? 'Signing in...'
                : isLoadingUser
                  ? 'Loading profile...'
                  : 'Sign In'}
            </Button>
          </Stack>
        </form>
      )}
    </Modal>
  )
}
