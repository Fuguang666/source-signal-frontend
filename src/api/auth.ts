import request from './request';
import type { LoginRequest, AuthResponse, RegisterRequest } from '@/types';

export const authApi = {
  login: (data: LoginRequest) =>
    request.post<unknown, AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    request.post<unknown, AuthResponse>('/auth/register', data),

  logout: () =>
    request.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    request.post<unknown, { token: string; refreshToken: string }>('/auth/refresh', { refreshToken }),

  changePassword: (oldPassword: string, newPassword: string) =>
    request.post('/auth/change-password', { oldPassword, newPassword }),
};
