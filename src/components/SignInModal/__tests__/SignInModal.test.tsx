import { describe, it, expect, waitFor } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/test-utils'
import { SignInModal } from '../SignInModal'
import { useStore } from '@/store/useStore'

describe('SignInModal', () => {
  it.skip('logs in', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignInModal isOpen onClose={() => {}} />)

    await user.type(screen.getByLabelText(/user/i), 'abc')
    await user.type(screen.getByLabelText(/password/i), '123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(useStore.getState().token).toBe('test-token'))
  })
})
