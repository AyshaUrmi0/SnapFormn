export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type OtpPurpose = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'LOGIN';
