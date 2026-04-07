import type { OtpPurpose } from '@snapform/shared';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface RegisterResponse {
  accessToken: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface VerifyOtpResponse {
  verified?: boolean;
  accessToken?: string;
  resetToken?: string;
  profileComplete?: boolean;
}

export interface RequestOtpResponse {
  sent: boolean;
}

export interface CompleteProfileResponse {
  accessToken: string;
}

export interface ResetPasswordResponse {
  success: boolean;
}

export type { OtpPurpose } from '@snapform/shared';

// Service input types (Keys)
export interface LoginKeys {
  email: string;
  password: string;
}

export interface RegisterKeys {
  email: string;
  name?: string;
  password?: string;
}

export interface VerifyOtpKeys {
  email: string;
  code: string;
  purpose: OtpPurpose;
}

export interface RequestOtpKeys {
  email: string;
  purpose: OtpPurpose;
}

export interface CompleteProfileKeys {
  firstName: string;
  lastName: string;
  password: string;
}

export interface ResetPasswordKeys {
  resetToken: string;
  newPassword: string;
}

export interface GoogleLoginKeys {
  accessToken: string;
}

export interface UpdateUserKeys {
  name?: string;
  avatarUrl?: string;
}
