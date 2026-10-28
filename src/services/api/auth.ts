import type { LoginRequest, RegisterRequest, Session } from '@/types/api'

import { apiClient } from './client'

export const authApi = {
  async register(body: RegisterRequest): Promise<Session> {
    return (await apiClient.post<Session>('/auth/register', body)).data
  },
  async login(body: LoginRequest): Promise<Session> {
    return (await apiClient.post<Session>('/auth/login', body)).data
  },
  async session(signal?: AbortSignal): Promise<Session> {
    return (await apiClient.get<Session>('/auth/session', { signal })).data
  },
  /** The token is passed explicitly because the local session is cleared before this call. */
  async logout(token: string): Promise<void> {
    await apiClient.post('/auth/logout', null, { headers: { Authorization: `Bearer ${token}` } })
  },
}
