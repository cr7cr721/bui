import { setupServer } from 'msw/node'
import { handlers } from '@/test/mocks/handlers.ts'
export const server = setupServer(...handlers)
