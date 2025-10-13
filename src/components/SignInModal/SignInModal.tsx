import { Modal, TextInput, PasswordInput, Button, Stack, Alert } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useLogin } from '../../hooks/useAuth'
import { useStore } from '../../store/useStore'
import { IconAlertCircle } from '@tabler/icons-react'

interface SignInModalProps {
    isOpen: boolean
    onClose: () => void
}

interface LoginCredentials {
    user: string
    password: string
}

export const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
    const { setAuthToken } = useStore()
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

    const handleSubmit = (values: LoginCredentials) => {
        loginMutation.mutate(values, {
            onSuccess: (response) => {
                setAuthToken(response.token)
                form.reset()
                onClose()
            }
        })
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