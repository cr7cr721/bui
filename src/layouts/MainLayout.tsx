// layouts/MainLayout.tsx
import { AppShell } from '@mantine/core'
import { Outlet } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { SignInModal } from '@/components/SignInModal/SignInModal'
import { Header } from './components/Header'

export const MainLayout = () => {
    const isSignInModalOpen = useStore((state) => state.isSignInModalOpen)
    const setSignInModalOpen = useStore((state) => state.setSignInModalOpen)

    return (
        <>
            <AppShell header={{ height: 70 }} padding="md">
                <AppShell.Header>
                    <Header />
                </AppShell.Header>

                <AppShell.Main>
                    <Outlet />
                </AppShell.Main>
            </AppShell>

            <SignInModal
                isOpen={isSignInModalOpen}
                onClose={() => setSignInModalOpen(false)}
            />
        </>
    )
}