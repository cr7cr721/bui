import { Outlet, Link, useLocation } from 'react-router-dom'
import { useVersion } from '../hooks/useApi'
import { useLogout } from '../hooks/useAuth'
import { useStore } from '../store/useStore'
import { SignInModal } from '../components/SignInModal/SignInModal'

export const MainLayout = () => {
    const location = useLocation()
    const { data: version } = useVersion()
    const logoutMutation = useLogout()
    const {
        isAuthenticated,
        isSignInModalOpen,
        setSignInModalOpen,
        clearAuth
    } = useStore()

    const isActive = (path: string) => location.pathname === path

    const handleSignOut = () => {
        logoutMutation.mutate(undefined, {
            onSuccess: () => {
                clearAuth()
            }
        })
    }

    // Check authentication status
    const authenticated = isAuthenticated()

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">BEAM Rules Dashboard - 1</h1>
                            {version && (
                                <p className="text-sm text-gray-500">Version: {version}</p>
                            )}
                        </div>

                        <div className="flex items-center space-x-6">
                            <nav className="flex space-x-6">
                                <Link
                                    to="/"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive('/')
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:text-blue-600'
                                    }`}
                                >
                                    Rules
                                </Link>
                                <Link
                                    to="/create-rule"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive('/create-rule')
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:text-blue-600'
                                    }`}
                                >
                                    Create Rule
                                </Link>
                                <Link
                                    to="/settings"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive('/settings')
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:text-blue-600'
                                    }`}
                                >
                                    Settings
                                </Link>
                            </nav>

                            {/* Auth Section */}
                            {authenticated ? (
                                <button
                                    onClick={handleSignOut}
                                    disabled={logoutMutation.isPending}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 disabled:opacity-50 transition-colors"
                                >
                                    {logoutMutation.isPending ? 'Signing Out...' : 'Sign Out'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setSignInModalOpen(true)}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <Outlet />
            </main>

            {/* Sign In Modal */}
            <SignInModal
                isOpen={isSignInModalOpen}
                onClose={() => setSignInModalOpen(false)}
            />
        </div>
    )
}
