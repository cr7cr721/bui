// services/auth.service.ts
import { httpClient } from './http-client'
import type { User } from '@/types/api'

export interface LoginCredentials {
  user: string
  password: string
}

export interface LoginResponse {
  token: string
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    httpClient.post<LoginResponse>('/user/login', credentials),

  getUser: () => httpClient.get<User>('/user'),

  getVersion: () => httpClient.get<string>('/version'),
}
