import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { MainLayout } from './layouts/MainLayout'
import { RulesListPage } from './pages/RulesListPage/RulesListPage'
import { RuleDetailPage } from './pages/RuleDetailPage/RuleDetailPage'
// import { CreateRulePage } from './pages/CreateRulePage/CreateRulePage'
// import { SettingsPage } from './pages/SettingsPage'
import './App.css'

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
})

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<RulesListPage />} />
                        <Route path="rules/:id" element={<RuleDetailPage />} />
                        {/*<Route path="create-rule" element={<CreateRulePage />} />*/}
                        {/*<Route path="settings" element={<SettingsPage />} />*/}
                    </Route>
                </Routes>
            </Router>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}

export default App