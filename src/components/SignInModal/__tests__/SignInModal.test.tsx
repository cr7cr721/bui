import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, waitFor, userEvent } from '@/test/test-utils'
import { SignInModal } from '../SignInModal'
import { useStore } from '@/store/useStore'

describe('<SignInModal />', () => {
  it('logs in successfully', async () => {
    renderWithProviders(<SignInModal isOpen onClose={() => {}} />)

    await userEvent.type(screen.getByLabelText(/user/i), 'test-user')
    await userEvent.type(screen.getByLabelText(/password/i), 'secret')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(useStore.getState().token).toBe('test-token')
    })
  })
})
