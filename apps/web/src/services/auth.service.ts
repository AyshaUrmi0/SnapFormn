import { api } from '@/lib/api-client';
import type { User, TokenPair, OtpPurpose } from '@/types/auth';

export const authService = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post<TokenPair>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<TokenPair>('/auth/login', data),

  verifyOtp: (data: { email: string; code: string; purpose: OtpPurpose }) =>
    api.post<TokenPair | null>('/auth/verify-otp', data),

  requestOtp: (data: { email: string; purpose: OtpPurpose }) =>
    api.post<void>('/auth/request-otp', data),

  refresh: () => api.post<TokenPair>('/auth/refresh'),

  logout: () => api.post<void>('/auth/logout'),
};

export const userService = {
  getMe: () => api.get<User>('/users/me'),

  updateMe: (data: { name?: string; avatarUrl?: string }) =>
    api.patch<User>('/users/me', data),

  deleteMe: () => api.del<void>('/users/me'),
};
