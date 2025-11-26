// components/SignInModal/SignInModal.tsx
import { Modal, TextInput, PasswordInput, Button, Stack, Alert } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useMutation } from '@tanstack/react-query'
import { useStore } from '@/store/useStore'
import { authService } from '@/services'
import type { LoginCredentials } from '@/services'
import { IconAlertCircle } from '@tabler/icons-react'

interface SignInModalProps {
    isOpen: boolean
    onClose: () => void
}

export const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
    const setToken = useStore((state) => state.setToken)

    const loginMutation = useMutation({
        mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
        onSuccess: (data) => {
            setToken(data.token)
            form.reset()
            onClose()
        }
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

    const handleSubmit = (values: LoginCredentials) => {
        loginMutation.mutate(values)
    }

    const handleClose = () => {
        form.reset()
        loginMutation.reset()
        onClose()
    }

    return (
        <Modal
            opened={isOpen}
            onClose={handleClose}
            title="Sign In"
            centered
            size="md"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label="Username"
                        placeholder="Enter your username"
                        {...form.getInputProps('user')}
                        autoComplete="username"
                    />

                    <PasswordInput
                        label="Password"
                        placeholder="Enter your password"
                        {...form.getInputProps('password')}
                        autoComplete="current-password"
                    />

                    {loginMutation.error && (
                        <Alert
                            icon={<IconAlertCircle size={16} />}
                            color="red"
                            variant="light"
                        >
                            {loginMutation.error.message}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        loading={loginMutation.isPending}
                    >
                        Sign In
                    </Button>
                </Stack>
            </form>
        </Modal>
    )
}