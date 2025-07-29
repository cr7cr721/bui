import { Outlet, Link, useLocation } from 'react-router-dom'
import { useVersion } from '../hooks/useApi'

export const MainLayout = () => {
    const location = useLocation()
    const { data: version } = useVersion()

    const isActive = (path: string) => location.pathname === path

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">BEAM Rules Dashboard</h1>
                            {version && (
                                <p className="text-sm text-gray-500">Version: {version}</p>
                            )}
                        </div>
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
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    )
}