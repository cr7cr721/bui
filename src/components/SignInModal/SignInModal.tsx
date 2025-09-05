import { useForm } from 'react-hook-form'
import { useLogin } from '../../hooks/useAuth'
import { useStore } from '../../store/useStore'
import styles from './SignInModal.module.scss'

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
                setAuthToken(response.token)
                reset()
                onClose()
            }
        })
    }

    const handleClose = () => {
        reset()
        loginMutation.reset()
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalBackdrop} onClick={handleClose}></div>
            <div className={styles.modalContainer}>
                <div className={styles.modalContent}>
                    {/* Header */}
                    <div className={styles.modalHeader}>
                        <div className={styles.headerContent}>
                            <div className={styles.authIcon}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className={styles.headerText}>
                                <h2>Sign In</h2>
                                <p>Access your BEAM dashboard</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className={styles.closeButton}
                            type="button"
                            aria-label="Close modal"
                        >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className={styles.modalForm}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Username
                            </label>
                            <input
                                type="text"
                                {...register('user', { required: 'Username is required' })}
                                className={`${styles.formInput} ${errors.user ? styles.error : ''}`}
                                placeholder="Enter your username"
                                autoComplete="username"
                            />
                            {errors.user && (
                                <p className={styles.formError}>{errors.user.message}</p>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Password
                            </label>
                            <input
                                type="password"
                                {...register('password', { required: 'Password is required' })}
                                className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                            {errors.password && (
                                <p className={styles.formError}>{errors.password.message}</p>
                            )}
                        </div>

                        {loginMutation.error && (
                            <div className={styles.errorBanner}>
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{loginMutation.error.message}</span>
                            </div>
                        )}

                        <div className={styles.formActions}>
                            <button
                                type="button"
                                onClick={handleClose}
                                className={styles.btnSecondary}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className={styles.btnPrimary}
                            >
                                {loginMutation.isPending ? (
                                    <div className={styles.loadingContent}>
                                        <div className={styles.spinner}></div>
                                        Signing In...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}