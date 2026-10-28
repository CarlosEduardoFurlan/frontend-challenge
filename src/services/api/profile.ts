import type { ChangePasswordRequest, UpdateProfileRequest, User } from '@/types/api'

import { apiClient } from './client'

export const profileApi = {
  async get(signal?: AbortSignal): Promise<User> {
    return (await apiClient.get<User>('/profile', { signal })).data
  },
  async update(body: UpdateProfileRequest): Promise<User> {
    return (await apiClient.patch<User>('/profile', body)).data
  },
  async changePassword(body: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/profile/password', body)
  },
}
