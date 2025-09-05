import { useForm } from 'react-hook-form'
import { useLogin } from '../../hooks/useAuth'
import { useStore } from '../../store/useStore'

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

    const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginCredentials>()

    const onSubmit = async (data: LoginCredentials) => {
        loginMutation.mutate(data, {
            onSuccess: (response) => {
                // Token is already set in the mutation, but we can also set it here for consistency
                setAuthToken(response.token)
                reset()
                onClose()
            }
        })
    }

    const handleClose = () => {
        reset()
        loginMutation.reset() // Clear any previous errors
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Sign In</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                        type="button"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            {...register('user', { required: 'Username is required' })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your username"
                        />
                        {errors.user && (
                            <p className="text-red-600 text-sm mt-1">{errors.user.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            {...register('password', { required: 'Password is required' })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                        />
                        {errors.password && (
                            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    {loginMutation.error && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                            {loginMutation.error.message}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}